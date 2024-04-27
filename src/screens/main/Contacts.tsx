import { NavigationProp } from "@react-navigation/native"
import { FlatList, View, RefreshControl } from "react-native"
import { ActivityIndicator, Avatar, Button, Text, TouchableRipple } from "react-native-paper"
import { useChosenLogin, useLogins, useSatori } from "../../globals/satori"
import { useEffect, useMemo, useState } from "react"
import { Event, Guild, List } from "../../satori/protocol"
import { StackParamList } from "../../globals/navigator"
import Element from "../../satori/element"
import { toPreviewString } from "../../components/elements/elements"
import { Contact } from "../../satori/sas"
import { Dict } from "cosmokit"

export const Contacts = ({ navigation }: {
    navigation: NavigationProp<StackParamList>
}) => {
    const login = useLogins()

    useEffect(() => {
        if (login && login.length === 0) {
            navigation.navigate('Login')
        }
    }, [login])

    const satori = useSatori()
    const [contacts, setContacts] = useState<{
        [key: string]: Contact
    }>({})

    const sortedContacts = useMemo(() => Object.values(contacts).sort((a, b) => {
        if (a.updateTime === undefined) return 1
        if (b.updateTime === undefined) return -1
        return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
    }), [contacts])

    const [chosenLogin, setChosenLogin] = useChosenLogin()

    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        if (satori === null) return
        satori.bot.getContactList().then(v => {
            setContacts(v)
        })
    }, [satori])

    return <View style={{
        marginHorizontal: 30,
        marginVertical: 30,
        flex: 1
    }}>
        <Text>你好</Text>
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignContent: 'center',
            marginTop: 10,
            marginBottom: 10,
        }}>
            <Avatar.Image source={{
                uri: chosenLogin?.user.avatar
            }} size={24} />
            <Text style={{
                fontSize: 24,
                marginLeft: 10,
            }}>{chosenLogin?.selfId}</Text>
        </View>

        <FlatList
            data={sortedContacts}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => {
                    setRefreshing(true)
                    satori.bot.getContactList().then(v => {
                        setContacts(v)
                        setRefreshing(false)
                    })
                }} />
            }
            style={{
                flex: 1
            }}
            renderItem={({ item }) => {
                const lastUsername = (item.coverUserNick || item.coverUserName) ?? item.coverUserId
                console.log(item)

                return <TouchableRipple onPress={async () => {
                    console.log(item)
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
                            }} numberOfLines={1} ellipsizeMode='tail'>{`${lastUsername ? lastUsername + ': ' : ''}${toPreviewString(item.coverMessage ?? '')}`}</Text>
                        </View>
                    </View>
                </TouchableRipple>
            }}
            keyExtractor={(item) => item.id}
            ListFooterComponent={contacts.next && <ActivityIndicator />}
        />
    </View>
}