import { NavigationProp, RouteProp } from "@react-navigation/native"
import { Avatar, Badge, Text } from "react-native-paper"
import { StackParamList } from "../globals/navigator"
import { Image, View } from "react-native"
import { useContactInfo, useLogins, useSatori } from "../globals/satori"
import { useEffect, useMemo, useState } from "react"
import { ContactMemberList } from "../components/contact-member-list"
import { GuildMember } from "../satori/protocol"

export const Contact = ({
    navigation, route
}: {
    navigation: NavigationProp<StackParamList>,
    route: RouteProp<{ Contact: StackParamList['Contact'] }>
}) => {
    const { contactInfo } = useContactInfo()
    const currentContact = useMemo(() => contactInfo.find(v => v.id === route.params.id), [route, contactInfo])
    const logins = useLogins()

    const satori = useSatori()
    const [members, setMembers] = useState<GuildMember[]>(null)

    useEffect(() => {
        if (satori === null) return
    }, [satori])

    return <View style={{
        flex: 1,
        paddingVertical: 60,
        paddingHorizontal: 30,
        gap: 30
    }}>
        <View style={{
            flexDirection: 'row',
            gap: 10
        }}>
            <Image source={{
                uri: route.params.avatar,
                height: 80,
                width: 80
            }} style={{
                borderRadius: 1000
            }}>

            </Image>

            <View style={{
                flexDirection: 'column',
                justifyContent: 'center',
                alignContent: 'flex-start'
            }}>
                <Text style={{
                    fontSize: 27,
                    fontWeight: '400'
                }}>
                    {route.params.name}
                </Text>
                <View style={{
                    flexDirection: 'row',
                    gap: 3
                }}>
                    <Badge>
                        {route.params.platform}
                    </Badge>
                </View>
                <Text style={{
                    fontSize: 14,
                    fontWeight: '400',
                    opacity: 0.4
                }}>
                    {route.params.id}
                </Text>
            </View>
        </View>

        <View style={{
            gap: 10
        }}>
            <View>
                <Text style={{
                    fontSize: 20,
                    fontWeight: '600'
                }}>
                    在此群组的账号
                </Text>
                <View style={{
                    gap: 10,
                    paddingVertical: 10
                }}>
                    {
                        currentContact?.whoIsHere.map(v => {
                            const login = logins.find(l => l.selfId === v)
                            return <View key={v} style={{
                                flexDirection: 'row',
                                gap: 10

                            }}>
                                <Avatar.Image source={{
                                    uri: login.user.avatar
                                }} size={24} />
                                <Text>{login.user.name ?? login.selfId}</Text>
                            </View>

                        })
                    }
                </View>

                <Text style={{
                    fontSize: 20,
                    fontWeight: '600'
                }}>
                    群组成员
                </Text>
                <View>
                    <ContactMemberList contact={currentContact}/>
                </View>
            </View>
        </View>
    </View>
}