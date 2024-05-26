import { NavigationProp } from "@react-navigation/native"
import { FlatList, View, RefreshControl, Pressable } from "react-native"
import { ActivityIndicator, Avatar, Button, Text, TouchableRipple } from "react-native-paper"
import { useContactInfo, useLogins, useSatori } from "../../globals/satori"
import { useEffect, useMemo, useState } from "react"
import { Event as SatoriEvent, Guild, List, asyncIterToArr } from "../../satori/protocol"
import { StackParamList } from "../../globals/navigator"
import Element from "../../satori/element"
import { toPreviewString } from "../../components/elements/elements"
import { Contact } from "../../satori/sas"
import { Dict } from "cosmokit"
import { LoginSelector } from "../../components/LoginSelectorMenu"

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
    const {
        contactInfo, setContactInfo
    } = useContactInfo()



    const sortedContacts = useMemo(() => Object.values(contactInfo).sort((a, b) => {
        if (a.updateTime === undefined) return 1
        if (b.updateTime === undefined) return -1
        
        return b.updateTime > a.updateTime ? 1 : -1
    }), [contactInfo])

    const [chosenLogin, setChosenLogin] = useState(login?.[0] ?? null)
    const [loginSelectorVisible, setLoginSelectorVisible] = useState(false)

    const [refreshing, setRefreshing] = useState(false)


    useEffect(() => {
        if (satori === null) return
        satori.bot({
            platform: 'discord',
            selfId: '700602097824956437'
        }).getGuildList().then(v => {
            console.log('vv')
            setContactInfo(v.data)
        }).catch(e=>{
            console.error(e)
        })
    }, [satori])

    useEffect(() => {
        const l = satori.addListener('message', (e: SatoriEvent) => {
            if (e.type === 'message-created') {
                // console.log(e, e.channel.id)
                if (!contactInfo.some(v => v.id === e.channel.id)) return
                const contact = contactInfo.find(v => v.id === e.channel.id)
                if (
                    e.timestamp < contact.updateTime
                ) return
                contact.coverMessage = e.message.content
                contact.coverUserId = e.message.user.id
                contact.coverUserNick = e.message.user.nick || e.message.user.name || e.member?.name
                contact.updateTime = e.timestamp
                // console.log(contact.updateTime)
                // console.log(e.message)
                setContactInfo([...contactInfo])
            }
        })

        return () => l.remove()
    }, [satori, contactInfo])

    return <View style={{
        marginHorizontal: 30,
        marginVertical: 30,
        flex: 1
    }}>
        <Text>你好</Text>
        <LoginSelector anchor={
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

        } onSelect={q => setChosenLogin(login.find(v => v.selfId === q.selfId) ?? null)}
            current={
                chosenLogin
            } logins={login} />

        <FlatList
            data={sortedContacts}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => {
                    setRefreshing(true)
                    satori.bot({
                        platform: 'discord',
                        selfId: '700602097824956437'
                    }).getGuildList().then(v => {
                        console.log('vv')
                        setContactInfo(v.data)
                    }).catch(e=>{
                        console.error(e)
                    })
                }} />
            }
            style={{
                flex: 1
            }}
            renderItem={({ item }) => {
                const lastUsername = (item.coverUserNick || item.coverUserName) ?? item.coverUserId

                return <TouchableRipple onPress={async () => {
                    navigation.navigate('ChannelSelect', {
                        guildId: item.id,
                        guildName: item.name,
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
        // ListFooterComponent={contactInfo.next && <ActivityIndicator />}
        />
    </View>
}