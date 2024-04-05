import { NavigationProp } from "@react-navigation/native"
import { FlatList, View } from "react-native"
import { ActivityIndicator, Avatar, Button, Text, TouchableRipple } from "react-native-paper"
import { useLogin, useSatori } from "../globals/satori"
import { useEffect, useMemo, useState } from "react"
import { Event, Guild, List } from "../satori/protocol"
import { StackParamList } from "../globals/navigator"
import { useMessageStore } from "../globals/message"
import Element from "../satori/element"

const toPreviewString = (v: string) => Element.parse(v).map(v => {
    if (v.type === 'text') return v.attrs.content.replaceAll('\n', ' ');
    if (v.type === 'quote') return `[回复]`
    if (v.type === 'img') return '[图片]'
    return '未知'
}).join(' ')

export const Main = ({ navigation }: {
    navigation: NavigationProp<StackParamList>
}) => {
    const login = useLogin()
    const satori = useSatori()
    const [guilds, setGuilds] = useState<List<Guild>>({
        data: [],
        next: 'unknown'
    })

    const [msgStore, setMsgStore] = useMessageStore()

    const sortedGuilds = useMemo(() => {
        return guilds.data.map(v => [v, msgStore?.[v.id]?.reduce((pre, cur) => {
            if (pre.timestamp < cur.timestamp) return cur;
            return pre;
        }, {
            timestamp: -1,
            content: v.id,
        }) ?? {
            timestamp: -1,
            content: v.id,
        }])
            .sort((a, b) => b[1].timestamp - a[1].timestamp)
    }, [guilds, msgStore])

    useEffect(() => {
        const l = satori?.addListener('message', (e: Event) => {
            console.log("RECV", e.type)
            if (e?.type === 'message-created') {
                setMsgStore(msgStore => {
                    msgStore[e.channel.id] ??= []
                    msgStore[e.channel.id].push(e.message)
                    return { ...msgStore }
                })
            }
        })

        return () => l?.remove()
    }, [satori, msgStore])


    useEffect(() => {
        if (satori === null) return
        satori.bot.getGuildList().then(v => {
            setGuilds(v)
        })
    }, [satori])

    return <View style={{
        marginHorizontal: 30,
        marginVertical: 30,
        flex: 1
    }}>
        <Text>你好，</Text>
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignContent: 'center',
            marginTop: 10,
            marginBottom: 10,
        }}>
            <Avatar.Image source={{
                uri: login?.user.avatar
            }} size={24} />
            <Text style={{
                fontSize: 24,
                marginLeft: 10,
            }}>{login?.selfId}</Text>
        </View>

        <FlatList
            data={sortedGuilds}
            style={{
                flex: 1
            }}
            renderItem={({ item: [item, lastMessage] }) => <TouchableRipple onPress={async () => {
                const guild = await satori.bot.getChannelList(item.id)
                navigation.navigate('Chat', {
                    guildId: item.id,
                    channelId: guild.data[0].id,
                    name: item.name ?? item.id,
                    avatar: item.avatar
                })
            }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignContent: 'center',
                    marginTop: 10,
                    marginBottom: 10,
                }}>
                    <Avatar.Image source={{
                        uri: item.avatar
                    }} size={34} />
                    <View>
                        <Text style={{
                            fontSize: 16,
                            marginLeft: 10,
                            fontWeight: '700'
                        }}>{item.name}</Text>
                        <Text style={{
                            fontSize: 13,
                            marginLeft: 10,
                            opacity: 0.5,
                            flex: 1
                        }} numberOfLines={1} ellipsizeMode='tail'>{`${lastMessage.user?.name ? lastMessage.user?.name + ': ' : ''}${toPreviewString(lastMessage.content)}`}</Text>
                    </View>
                </View>
            </TouchableRipple>}
            keyExtractor={(item) => item[0].id}
            onEndReached={() => {
                if (!guilds.next) return
                satori?.bot.getGuildList(guilds.next).then(v => {
                    setGuilds({
                        data: [...guilds.data, ...v.data],
                        next: v.next
                    })
                })
            }}
            onEndReachedThreshold={0.8}
            ListFooterComponent={guilds.next && <ActivityIndicator />}
        />
    </View>
}