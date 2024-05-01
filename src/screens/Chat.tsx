import { NavigationProp, RouteProp } from "@react-navigation/native"
import { StackParamList } from "../globals/navigator"
import { Alert, Pressable, ToastAndroid, View } from "react-native"
import { FlatList } from "react-native-bidirectional-infinite-scroll";
import { ActivityIndicator, Avatar, Card, Chip, Divider, Icon, IconButton, MD3Colors, Menu, Text, TextInput, TouchableRipple } from "react-native-paper"
import { createContext, memo, useCallback, useContext, useEffect, useInsertionEffect, useMemo, useReducer, useRef, useState } from "react"
import { useContactInfo, useLogins, useSatori } from "../globals/satori"
import { Channel, Event as SatoriEvent, Guild, List, Message as SaMessage, BotInfo } from "../satori/protocol"
import Element from "../satori/element"
import { elementRendererMap, renderElement, elementToObject, toPreviewString } from "../components/elements/elements"
import React from "react"
import Clipboard from "@react-native-clipboard/clipboard"
import { create, createStore, useStore } from "zustand"
import Animated, { Easing, FadeIn, Keyframe, LinearTransition, getRelativeCoords, measure, useAnimatedRef, useFrameCallback, useSharedValue, withTiming } from "react-native-reanimated"
import { LoginSelector } from "../components/LoginSelectorMenu";
import { useConfigKey } from "../globals/config";

interface GroupInfo {
    groupIndex: number
    groupTotal: number
}

const ChatContext = createContext<ChatStore>(null)

type ChatStore = ReturnType<typeof createChatStore>
const createChatStore = () => {
    return createStore<{
        replyTo: SaMessage | null,
        setReplyTo: (msg: SaMessage | null) => void,
        visibleMessages: number[],
        setVisibleMessages: (v: number[]) => void
    }>()((set) => ({
        replyTo: null,
        setReplyTo: (msg) => {
            set({
                replyTo: msg
            })
        },
        visibleMessages: [],
        setVisibleMessages: (v) => {
            set({
                visibleMessages: v
            })
        }
    }))
}

const Message = memo(({ message, curLogin, index }: { message: SaMessage & GroupInfo, curLogin: BotInfo, index: number }) => {
    const content = useMemo(() => Element.parse(message.content).map(elementToObject), [message]);
    const login = useLogins()
    const isSelf = login?.some(v => v.user.id === message.user.id) ?? false
    const [menuVisible, setMenuVisible] = useState(false)
    const [menuAnchor, setMenuAnchor] = useState<{
        x: number,
        y: number
    } | null>(null)
    const [msgStore, setMsgStore] = useState([])
    const satori = useSatori()

    const store = useContext(ChatContext)
    const setReplyTo = useStore(store, v => v.setReplyTo)
    const isLastVisible = useStore(store, v => {
        for (let i = 0; i < message.groupIndex; i++) {
            if (!v.visibleMessages.includes(i + message.groupIndex - message.groupTotal)) return false
        }
        return true
    })

    const refMessageView = useAnimatedRef();
    // useFrameCallback((fi) => {
    //     if (isLastVisible) {
    //         console.log(refMessageView)
    //         if(refMessageView)
    //         // getRelativeCoords(refMessageView, 0, 0)?.y
    //     }
    // })

    return <Animated.View style={{
        overflow: 'visible'
    }} ref={refMessageView}>
        <TouchableRipple style={{
            marginVertical: 10,
            alignItems: isSelf ? 'flex-end' : 'baseline',
            height: 'auto'
        }} onPress={e => {
            setMenuAnchor({
                x: e.nativeEvent.pageX,
                y: e.nativeEvent.pageY
            })
            setMenuVisible(true)
        }}>
            <>
                <View style={{
                    flexDirection: isSelf ? 'row-reverse' : 'row',
                    gap: 10,
                }}>
                    {message.user && isLastVisible ?
                     <><Avatar.Image source={{ uri: message.user.avatar }} size={20}/>
                        <Text>{message.member?.name || message.user?.name || message.user.id}</Text></> : <Text>Unknown user</Text>}
                </View>
                <Card style={{
                    marginVertical: 8,
                    paddingHorizontal: 15,
                    padding: 10,
                    borderRadius: 20
                }}>
                    {
                        content.map(renderElement)
                    }
                </Card>

                <Menu
                    anchor={menuAnchor}
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                >
                    <Menu.Item onPress={async () => {
                        setMenuVisible(false)


                        await satori.bot(curLogin).createMessage(message.channel.id, message.content, message.guild.id)
                    }} title="+1" />
                    <Menu.Item onPress={() => {
                        setMenuVisible(false)

                        const content = Element.parse(message.content)
                        const text = content.map(v => v.attrs?.content).filter(v => v).join(' ')
                        console.log('copy', text)
                        Clipboard.setString(text)
                        // ToastAndroid.show('已复制', ToastAndroid.SHORT)
                    }} title="复制" />
                    <Menu.Item onPress={() => {
                        setMenuVisible(false)

                        setMsgStore(msgStore => {
                            msgStore[message.channel.id] = msgStore[message.channel.id].filter(v => v.id !== message.id)
                            return { ...msgStore }
                        })

                        ToastAndroid.show('已删除', ToastAndroid.SHORT)
                    }} title="删除" />
                    <Menu.Item onPress={() => {
                        setMenuVisible(false)

                        setReplyTo(message)
                    }} title="回复" />
                    <Menu.Item onPress={() => {
                        setMenuVisible(false)
                        const inspect = v => JSON.stringify(v, null, 4)
                        Alert.alert('消息信息',
                            `
ID ${message.id}
Sender ${inspect(message.user)}
Channel ${inspect(message.channel)}
Content ${inspect(content)}
`)
                        console.log('inspect', message)
                    }} title="详细信息" />
                </Menu>
            </>
        </TouchableRipple >
    </Animated.View>
})

export const Chat = ({
    navigation, route
}: {
    navigation: NavigationProp<StackParamList>,
    route: RouteProp<StackParamList>
}) => {
    const satori = useSatori()
    const [currentInput, setCurrentInput] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const [messages, setMessages] = useState<SaMessage[]>(null);

    const [menuMessage, setMenuMessage] = useState<SaMessage | null>(null)
    const [channelMenuVisible, setChannelMenuVisible] = useState(false)

    const [replyTo, setReplyTo] = useState<SaMessage | null>(null)

    const [refreshing, setRefreshing] = useState(false)


    const [loginSelectorVisible, setLoginSelectorVisible] = useState(false)

    const [mergeMessage] = useConfigKey('mergeMessage')
    const chatStore = useRef(createChatStore()).current
    const { contactInfo } = useContactInfo()
    const currentContact = useMemo(() =>
        contactInfo.find(v => v.id === route.params.channelId &&
            v.platform === route.params.platform),

        [contactInfo, route.params.channelId])

    const allLogins = useLogins()
    const logins = useMemo(() => {
        console.log(currentContact?.whoIsHere)
        if (!currentContact) return []
        return allLogins.filter(v =>
            // v.platform === route.params.platform &&
            currentContact?.whoIsHere.includes?.(v.selfId)
        )
    },
        [allLogins, route.params.platform, currentContact])
    const [curLogin, setChosenLogin] = useState(logins?.[0] ?? null)



    const mergeMessages = (msgs: SaMessage[]) => {
        const newMsgs = []
        for (const msg of msgs) {
            if (newMsgs.length === 0) {
                newMsgs.push(msg)
                continue
            }

            const lastMsg = newMsgs[newMsgs.length - 1]
            if (lastMsg.user.id === msg.user.id && lastMsg.content === msg.content) {
                continue
            } else {
                newMsgs.push(msg)
            }
        }

        return newMsgs
    }

    const mergedMessages = useMemo(() => {
        if (!messages) return []
        if (!mergeMessage) return messages
        return mergeMessages(messages)
    }, [messages, mergeMessage])

    const packedMessages = useMemo(() => {
        const packed = []
        for (const msg of mergedMessages) {
            if (packed.length === 0) {
                packed.push({
                    user: msg.user,
                    messages: [msg]
                })
                continue
            }

            const last = packed[packed.length - 1]
            if (last.user.id === msg.user.id) {
                last.messages.push(msg)
            } else {
                packed.push({
                    user: msg.user,
                    messages: [msg]
                })
            }
        }

        return packed.flatMap(v => v.messages.map((msg, i) => {
            return {
                ...msg,
                groupIndex: i,
                groupTotal: v.messages.length
            }
        }))
    }, [mergedMessages])

    useEffect(() => {
        if (!satori) return;

        // satori.bot.getMessageList(route.params.channelId).then(setMessages)
        //    satori.bot.getChannel(route.params.channelId).then(setChannel)
        //    satori.bot.getGuild(route.params.guildId).then(setGuild)
    }, [satori, route.params])


    useEffect(() => {
        console.log('update messages')
        satori.bot(curLogin).getMessageListSAS(route.params.channelId, null, 'asc').then(v => {
            setMessages(v)
        })
    }, [mergeMessage])

    useEffect(() => {
        if (!satori) return
        const l = satori.addListener('message', (e: SatoriEvent) => {
            // console.log(
            //     'message',
            //     e?.message?.content,
            //     e?.message?.channel?.id,
            //     route.params.channelId
            // )
            if (e?.message && e?.channel?.id === route.params.channelId) {
                setMessages(v => {
                    v.unshift(e.message)
                    return [...v]
                })
            }
        })

        return () => {
            l.remove()
        }
    }, [satori, messages])

    const setVisibleMessages = useStore(chatStore, v => v.setVisibleMessages)

    if (messages === null) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
    </View>

    return <ChatContext.Provider value={chatStore}>
        <View style={{ flex: 1, margin: 20 }}>
            <Menu
                visible={channelMenuVisible}
                onDismiss={() => setChannelMenuVisible(false)}
                anchor={
                    <TouchableRipple onPress={() => setChannelMenuVisible(true)}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            paddingBottom: 10
                        }}>
                            <Avatar.Image source={{ uri: route.params.avatar }} size={30} />
                            <Text style={{
                                fontSize: 19,
                                fontWeight: '700'
                            }}>{route.params.name}</Text>
                        </View>
                    </TouchableRipple>
                }>
                <Menu.Item onPress={() => {
                    // setMsgStore(msgStore => {
                    //     msgStore[route.params.channelId] = []
                    //     return { ...msgStore }
                    // })
                }} title="清除当前聊天数据" />
            </Menu>
            <FlatList
                removeClippedSubviews
                enableAutoscrollToTop
                maxToRenderPerBatch={5}
                windowSize={8}
                data={packedMessages}
                inverted
                // maintainVisibleContentPosition={{
                //     minIndexForVisible: 1,
                //     autoscrollToTopThreshold: 10
                // }}
                onViewableItemsChanged={e => {
                    setVisibleMessages(e.viewableItems.map(v => v.index))
                }}
                refreshing={refreshing}
                onEndReached={async () => {
                    setRefreshing(true)
                    const v = await satori.bot(curLogin).getMessageListSAS(route.params.channelId, messages[messages.length - 1].id, 'desc')
                    console.log(v)
                    setMessages(v.concat(messages))
                    setRefreshing(false)
                }}
                onStartReached={async () => {

                }}
                style={{
                    flex: 1
                }}
                renderItem={({ item, index }) =>
                    <View onLayout={e => {
                        // console.log('layout', e.nativeEvent.layout)
                    }}>
                        <Message message={item} curLogin={curLogin} index={index} />
                    </View>}

                onScroll={(e) => {
                    // console.log('scroll', e.nativeEvent.contentOffset.y)
                    // get the current displayed messages

                    // console.log('messages', e.currentTarget.)

                }}
            />


            <View style={{
                flexDirection: 'column',
                height: 'auto'
            }}>
                {
                    replyTo && <View style={{
                        flexDirection: 'row',
                        height: 70,
                        marginTop: 10
                    }}>
                        <Card style={{
                            borderRadius: 20,
                            flexDirection: 'column'
                        }} onPress={() => setReplyTo(null)} mode="contained">
                            <View style={{
                                paddingTop: 15,
                                paddingHorizontal: 15
                            }}>
                                <View style={{
                                    flexDirection: 'row',
                                    gap: 10
                                }}>
                                    <Icon source='reply' size={20} />
                                    <Avatar.Image source={{ uri: replyTo.user?.avatar }} size={20} />
                                    <Text>{replyTo.user?.name ?? replyTo.user?.id}</Text>
                                </View>

                                <Text>{toPreviewString(replyTo.content)}</Text>
                            </View>
                        </Card>

                    </View>
                }

                <View style={{
                    flexDirection: 'row',
                    height: "auto"
                }}>
                    <Pressable onPress={() => {
                        setLoginSelectorVisible(true)
                    }} style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        alignContent: 'center',
                        marginTop: 10,
                        marginBottom: 10,
                        marginRight: 10
                    }}>
                        <LoginSelector anchor={
                            <Avatar.Image source={{ uri: curLogin?.user.avatar }} size={30} />
                        } onSelect={q => {
                            setChosenLogin(q)
                        }} current={curLogin} logins={logins} />
                    </Pressable>
                    <TextInput multiline value={currentInput} onChangeText={v => setCurrentInput(v)} mode='flat' style={{ backgroundColor: 'transparent', flex: 1 }} />
                    <IconButton
                        icon='send'
                        mode="contained"
                        disabled={false && currentInput === ''}
                        onPress={async () => {
                            //setSendingMessage(true)
                            let elems = [Element.text(currentInput)]
                            if (replyTo) {
                                elems.unshift(Element.jsx('quote', {
                                    id: replyTo.id
                                }))
                                setReplyTo(null)
                            }

                            console.log('sendMsg', JSON.stringify(elems, null, 4), elems.map(v => v.toString()).join(''))

                            satori.bot(curLogin).createMessage(route.params.channelId,
                                elems.map(v => v.toString(true)).join(''),
                                route.params.guildId)
                                .catch(e => {
                                    Alert.alert('发送失败', e.message)
                                })

                            setCurrentInput('')
                            //setSendingMessage(false)
                        }}
                        loading={sendingMessage}
                    />
                </View>
            </View>
        </View>
    </ChatContext.Provider>
}