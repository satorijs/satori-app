import { NavigationProp, RouteProp } from "@react-navigation/native"
import { StackParamList } from "../globals/navigator"
import { Alert, Pressable, ToastAndroid, View } from "react-native"
import { FlatList } from "react-native-bidirectional-infinite-scroll";
import { ActivityIndicator, Avatar, Card, Chip, Divider, Icon, IconButton, MD3Colors, Menu, Text, TextInput, TouchableRipple } from "react-native-paper"
import { createContext, createElement, memo, useCallback, useContext, useEffect, useInsertionEffect, useMemo, useReducer, useRef, useState } from "react"
import { useContactInfo, useLogins, useSatori } from "../globals/satori"
import { Channel, Event as SatoriEvent, Guild, List, Message as SaMessage, BotInfo } from "../satori/protocol"
import Element from "../satori/element"
import { elementRendererMap, renderElement, elementToObject, toPreviewString, renderElements } from "../components/elements/elements"
import React from "react"
import Clipboard from "@react-native-clipboard/clipboard"
import { create, createStore, useStore } from "zustand"
import Animated, { Easing, FadeIn, Keyframe, LinearTransition, getRelativeCoords, measure, useAnimatedRef, useFrameCallback, useSharedValue, withTiming } from "react-native-reanimated"
import { LoginSelector } from "../components/LoginSelectorMenu";
import { useConfigKey } from "../globals/config";
import { BidirectionalFlatList } from "../components/bid-list";
import { AutoMenu } from "../components/automenu";

const MESSAGE_CTX_WINDOW_SIZE = 50

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

    const [bubbleType, setBubbleType] = useConfigKey('bubbleType')
    const [avatarType, setAvatarType] = useConfigKey('avatarType')
    const isFirstMsg = message.groupIndex === message.groupTotal - 1
    const isLastMsg = message.groupIndex === 0
    const avatarVisible = (avatarType === 'first' && isFirstMsg) ||
        (avatarType === 'full')

    const bubbleComponent = bubbleType === 'material' ? Card : View

    return <View style={{
        overflow: 'visible'
    }}>
        <TouchableRipple style={{
            alignItems: isSelf ? 'flex-end' : 'baseline',
            height: 'auto',
            marginBottom: isLastMsg ? 10 : 0,
        }} onPress={e => {
            setMenuAnchor({
                x: e.nativeEvent.pageX,
                y: e.nativeEvent.pageY
            })
            setMenuVisible(true)
        }}>
            <>
                {
                    avatarVisible && <View style={{
                        flexDirection: isSelf ? 'row-reverse' : 'row',
                        gap: 10
                    }}>
                        {message.user ?
                            <><Avatar.Image source={{ uri: message.user.avatar }} size={20} />
                                <Text>{message.member?.name || message.user?.name || message.user.id}</Text></> : <Text>Unknown user</Text>}
                    </View>
                }

                {
                    createElement(bubbleComponent, {
                        style: {
                            marginTop: avatarVisible ? 8 : 6,
                            paddingHorizontal: 15,
                            paddingVertical: bubbleType === 'none' ? 0 : 10,
                            borderRadius: 20
                        }
                    }, renderElements(content))
                }

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
    </View>
})

export const Chat = ({
    navigation, route
}: {
    navigation: NavigationProp<StackParamList>,
    route: RouteProp<{ Chat: StackParamList['Chat'] }>
}) => {
    const satori = useSatori()
    const [currentInput, setCurrentInput] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);

    // 越往后越老
    const [messages, setMessages] = useState<SaMessage[]>(null);
    const [isPresentState, setIsPresentState] = useState(true)

    const [replyTo, setReplyTo] = useState<SaMessage | null>(null)

    const [refreshing, setRefreshing] = useState(false)

    const [mergeMessage] = useConfigKey('mergeMessage')
    const chatStore = useRef(createChatStore()).current
    const { contactInfo } = useContactInfo()
    const currentContact = useMemo(() =>
        contactInfo.find(v => v.id === route.params.channelId &&
            v.platform === route.params.platform),

        [contactInfo, route.params.channelId])

    const allLogins = useLogins()
    const logins = useMemo(() => {
        if (!currentContact) return []
        return allLogins.filter(v =>
            v.platform === route.params.platform &&
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
        satori.bot(curLogin).getMessageListSAS(route.params.channelId, null, 'up').then(v => {
            setMessages(v)
        })
    }, [mergeMessage])

    useEffect(() => {
        if (!satori) return
        const l = satori.addListener('message', (e: SatoriEvent) => {

            if (isPresentState && e?.message && e?.channel?.id === route.params.channelId) {
                setMessages(v => {
                    v ??= []
                    v.unshift(e.message)
                    return [...v]
                })
            }
        })

        return () => {
            l.remove()
        }
    }, [satori, messages, isPresentState])

    const setVisibleMessages = useStore(chatStore, v => v.setVisibleMessages)

    if (messages === null) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
    </View>

    return <ChatContext.Provider value={chatStore}>
        <View style={{ flex: 1, margin: 20 }}>
            <TouchableRipple onPress={() => navigation.navigate('Contact', {
                platform: route.params.platform,
                id: route.params.guildId,
                name: route.params.name,
                avatar: route.params.avatar
            })}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            // justifyContent: 'center',
                            paddingBottom: 10,
                            gap: 10
                        }}>
                        <Animated.Image source={{ uri: route.params.avatar }} style={{
                            borderRadius: 20,
                            width: 20,
                            height: 20
                        }} />
                        <Animated.Text
                            style={{
                                fontSize: 19,
                                fontWeight: '400'
                            }}>{route.params.name}</Animated.Text>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingBottom: 10,
                        gap: 10
                    
                    }}>
                        <AutoMenu anchor={
                            <Icon source='dots-horizontal' size={20} />
                        }>

                            <Menu.Item onPress={() => {
                                navigation.navigate('Contact', {
                                    platform: route.params.platform,
                                    id: route.params.guildId,
                                    name: route.params.name,
                                    avatar: route.params.avatar
                                })
                            }} title="查看详情" />
                            <Menu.Item onPress={() => {
                                console.log('leave', route.params.guildId)
                            }} title="退出群聊" />

                        </AutoMenu>
                    </View>
                </View>
            </TouchableRipple>
            <BidirectionalFlatList
                removeClippedSubviews
                enableAutoscrollToTop
                maxToRenderPerBatch={5}
                autoscrollToTopThreshold={2}
                windowSize={8}
                data={packedMessages}
                inverted
                onEndReachedThreshold={8}
                onStartReachedThreshold={8}
                keyExtractor={v => v.id}
                onViewableItemsChanged={e => {
                    setVisibleMessages(e.viewableItems.map(v => v.index))
                }}
                refreshing={refreshing}
                onEndReached={async () => {
                    setRefreshing(true)
                    const v = await satori.bot(curLogin).getMessageListSAS(
                        route.params.channelId,
                        messages[messages.length - 1].id,
                        'up')
                    // setIsPresentState(false)
                    setMessages([...messages, ...v])
                    setRefreshing(false)
                }}
                onStartReached={async () => {
                    setRefreshing(true)
                    const v = await satori.bot(curLogin).getMessageListSAS(
                        route.params.channelId,
                        messages[0].id,
                        'down')

                    setRefreshing(false)
                    if (v.length === 0) {
                        setIsPresentState(true)
                        return
                    }
                    setMessages([...v, ...messages])
                }}
                style={{
                    flex: 1
                }}
                renderItem={({ item, index }) =>
                    <Message message={item} curLogin={curLogin} index={index} />}

                onScroll={(e) => {
                    // console.log('scroll', e.nativeEvent.contentOffset.y)
                    // get the current displayed messages

                    // console.log('messages', e.currentTarget.)

                }}
                FooterLoadingIndicator={
                    () =>
                        <ActivityIndicator color={MD3Colors.secondary70} size={30} style={{
                            position: 'static',
                            top: 30,
                            height: 1
                        }} />
                }
                HeaderLoadingIndicator={
                    () => <ActivityIndicator color={MD3Colors.secondary70} size={30} style={{
                        position: 'static',
                        top: 30,
                        height: 1
                    }} />
                }
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
                    <Pressable style={{
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