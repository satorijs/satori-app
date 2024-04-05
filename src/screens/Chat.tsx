import { NavigationProp, RouteProp } from "@react-navigation/native"
import { StackParamList } from "../globals/navigator"
import { Alert, FlatList, View } from "react-native"
import { ActivityIndicator, Avatar, Card, Icon, IconButton, MD3Colors, Text, TextInput } from "react-native-paper"
import { memo, useEffect, useInsertionEffect, useMemo, useReducer, useRef, useState } from "react"
import { useSatori } from "../globals/satori"
import { Channel, Event as SatoriEvent, Guild, List, Message as SaMessage } from "../satori/protocol"
import Element from "../satori/element"
import { useMessageStore } from "../globals/message"
import { elementRendererMap, renderElement, elementToObject } from "../components/elements/elements"
import React from "react"

const Message = memo(({ message }: { message: SaMessage }) => {
    const content = useMemo(() => Element.parse(message.content).map(elementToObject), [message]);

    return <View style={{
        marginVertical: 10
    }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
            {message.user ? <><Avatar.Image source={{ uri: message.user.avatar }} size={20} />
                <Text>{message.user.name ?? message.user.id}</Text></> : <Text>Unknown user</Text>}
        </View>
        <Card style={{
            marginVertical: 10,
            padding: 10
        }} onLongPress={() => {
            const inspect = v=>JSON.stringify(v, null, 4)
            Alert.alert('消息信息', 
`Sender ${inspect(message.user)}
Channel ${inspect(message.channel)}
Content ${inspect(content)}`)
        }}>
            {
                content.map(renderElement)
            }
        </Card>
    </View>
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
                    console.log(msgStore[route.params.channelId])
                    setMessages(v => msgStore[route.params.channelId])
                    flatListRef.current.forceUpdate(() => {
                        flatListRef.current.scrollToIndex({
                            animated: true,
                            index: 0
                        })
                    })
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
            flexDirection: 'row',
            height: 40
        }}>
            <TextInput multiline value={currentInput} onChangeText={v => setCurrentInput(v)} mode='flat' style={{ backgroundColor: 'transparent', flex: 1 }} />
            <IconButton
                icon='send'
                mode="contained"
                disabled={currentInput === ''}
                onPress={async () => {
                    setSendingMessage(true)
                    const msgs = await satori.bot.createMessage(route.params.channelId, currentInput, route.params.guildId)
                    flatListRef.current.scrollToIndex({
                        animated: true,
                        index: 0
                    })
                    setCurrentInput('')
                    setSendingMessage(false)
                }}
                loading={sendingMessage}
            />
        </View>
    </View>
}