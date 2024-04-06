import { NavigationProp, RouteProp } from "@react-navigation/native"
import { StackParamList } from "../globals/navigator"
import { Alert, FlatList, ToastAndroid, View } from "react-native"
import { ActivityIndicator, Avatar, Card, Chip, Divider, Icon, IconButton, MD3Colors, Menu, Text, TextInput, TouchableRipple } from "react-native-paper"
import { memo, useEffect, useInsertionEffect, useMemo, useReducer, useRef, useState } from "react"
import { useLogin, useSatori } from "../globals/satori"
import { Channel, Event as SatoriEvent, Guild, List, Message as SaMessage } from "../satori/protocol"
import Element from "../satori/element"
import { useMessageStore } from "../globals/message"
import { elementRendererMap, renderElement, elementToObject, toPreviewString } from "../components/elements/elements"
import React from "react"
import Clipboard from "@react-native-clipboard/clipboard"
import { create } from "zustand"
import Animated, { Easing, FadeIn, Keyframe, LinearTransition, useSharedValue, withTiming } from "react-native-reanimated"

const useReplyTo = create<{
    replyTo: SaMessage | null,
    setReplyTo: (replyTo: SaMessage | null) => void
}>(set => ({
    replyTo: null,
    setReplyTo: replyTo => set({ replyTo })
}))

const Message = memo(({ message }: { message: SaMessage }) => {
    const content = useMemo(() => Element.parse(message.content).map(elementToObject), [message]);
    const login = useLogin()
    const isSelf = login?.selfId === message.user?.id
    const [menuVisible, setMenuVisible] = useState(false)
    const [menuAnchor, setMenuAnchor] = useState<{
        x: number,
        y: number
    } | null>(null)
    const [msgStore, setMsgStore] = useMessageStore()
    const satori = useSatori()

    const { setReplyTo } = useReplyTo()

    const animMaxHeight = useSharedValue(0);

    useEffect(() => {
        if ((Date.now() - message.timestamp * 1000) < 1000) {
            animMaxHeight.value = withTiming(500, {
                duration: 300,
                easing: Easing.linear
            })

            setTimeout(() => {
                animMaxHeight.value = 2000
            }, 1000)
        }
        else
            animMaxHeight.value = 2000
    }, [message])

    return <Animated.View style={{
        //            height: 20
        maxHeight: animMaxHeight,
        overflow: 'visible'
    }}>
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
                    {message.user ? <><Avatar.Image source={{ uri: message.user.avatar }} size={20} />
                        <Text>{message.user.name ?? message.user.id}</Text></> : <Text>Unknown user</Text>}
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

                        await satori.bot.createMessage(message.channel.id, message.content, message.guild.id)
                    }} title="+1" />
                    <Menu.Item onPress={() => {
                        setMenuVisible(false)

                        const content = Element.parse(message.content)
                        const text = content.map(v => v.attrs?.text).filter(v => v).join(' ')

                        Clipboard.setString(text)
                        ToastAndroid.show('已复制', ToastAndroid.SHORT)
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
                            `Sender ${inspect(message.user)}
        Channel ${inspect(message.channel)}
        Content ${inspect(content)}`)
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
    // const [messages, setMessages] = useState<List<SaMessage>>({
    //     data: [],
    //     next: 'smth'
    // })
    //const [channel, setChannel] = useState<Channel | null>(null)
    //const [guild, setGuild] = useState<Guild | null>(null)

    const [currentInput, setCurrentInput] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const [msgStore, setMsgStore] = useMessageStore()
    const [messages, setMessages] = useState<SaMessage[]>([]);

    const [menuMessage, setMenuMessage] = useState<SaMessage | null>(null)
    const [channelMenuVisible, setChannelMenuVisible] = useState(false)

    const { replyTo, setReplyTo } = useReplyTo()

    useEffect(() => {
        if (!satori) return;

        // satori.bot.getMessageList(route.params.channelId).then(setMessages)
        //    satori.bot.getChannel(route.params.channelId).then(setChannel)
        //    satori.bot.getGuild(route.params.guildId).then(setGuild)
    }, [satori, route.params])

    useEffect(() => {
        if (!satori) return
        const l = satori.addListener('message', (e: SatoriEvent) => {
            if (e?.message && e?.channel?.id === route.params.channelId) {
                console.log('update')

                setTimeout(() => {
                    setMessages(v => msgStore[route.params.channelId])
                }, 100)
            }
        })

        return () => {
            l.remove()
        }
    }, [satori, msgStore])

    const flatListRef = useRef<FlatList<SaMessage>>(null)

    useEffect(() => {
        console.log('update messages')
        if (msgStore[route.params.channelId]) {
            setMessages(msgStore[route.params.channelId])
        }
    }, [msgStore])

    if (!msgStore) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
    </View>

    return <View style={{ flex: 1, margin: 20 }}>
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
                setMsgStore(msgStore => {
                    msgStore[route.params.channelId] = []
                    return { ...msgStore }
                })
            }} title="清除当前聊天数据" />
        </Menu>
        <FlatList
            ref={flatListRef}
            data={[...messages].reverse()}
            inverted
            style={{
                flex: 1
            }}
            renderItem={({ item }) => <Message message={item} />}
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
                                id: replyTo.id,
                                'chronocat:seq': replyTo.id
                            }, [
                                Element.jsx('author', {
                                    id: replyTo.user?.id,
                                    name: replyTo.user?.name ?? replyTo.user?.id,
                                    avatar: replyTo.user?.avatar
                                }),
                                ...Element.parse(replyTo.content)
                            ]))
                            setReplyTo(null)
                        }

                        console.log('sendMsg', JSON.stringify(elems, null, 4), elems.map(v => v.toString()).join(''))

                        satori.bot.createMessage(route.params.channelId,
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
}