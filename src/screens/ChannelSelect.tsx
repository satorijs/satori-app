import { NavigationProp, RouteProp } from "@react-navigation/native"
import { ActivityIndicator, Avatar, Icon, Text } from "react-native-paper"
import { StackParamList } from "../globals/navigator"
import { Pressable, View, FlatList } from "react-native"
import { useEffect, useState } from "react"
import { useSatori } from "../globals/satori"

export const ChannelSelect = ({
    navigation, route
}: {
    navigation: NavigationProp<StackParamList>,
    route: RouteProp<{ ChannelSelect: StackParamList['ChannelSelect'] }>
}) => {
    const [channels, setChannels] = useState(null)

    const satori = useSatori()
    useEffect(() => {
        satori.bot({
            platform: 'discord',
            selfId: '700602097824956437'
        }).getChannelList(route.params.guildId).then(v => {
            console.log('get channel list', v)
            setChannels(v.data)
        })
    }, [route])

    return <View style={{ flex: 1, margin: 20, gap: 10 }}>
        <Text>选择频道</Text>
        <View style={{
            flexDirection: 'row',
            gap: 5,
            alignItems: 'center'
        }}>
            <Avatar.Image size={30} source={{ uri: route.params.avatar }} />
            <Text variant='titleMedium'>{route.params.guildName}</Text>
        </View>

        {
            channels ? <FlatList
                data={channels}
                renderItem={({ item }) => {
                    if (item.type === 3) return <View>
                        
                        <Text variant='titleSmall'>{item.name}</Text>
                    </View>

                    return <Pressable onPress={() => {
                        navigation.navigate('Chat', {
                            channelId: item.id,
                            channelName: item.name,
                            guildId: route.params.guildId,
                            guildName: route.params.guildName,
                            avatar: route.params.avatar,
                            platform: 'discord'
                        })
                    }}>
                        <View key={item.id} style={{
                            flexDirection: 'row',
                            gap: 5,
                            alignItems: 'center',
                            paddingVertical: 10
                        }}>
                            <Icon size={20} source={
                                item.type === 0 ? 'format-color-text' :
                                    item.type === 1 ? 'account' :
                                        item.type === 3 ? 'format-list-bulleted-type' :
                                            item.type === 2 ? 'account-tie-voice' : ''
                            } />
                            <Text variant='titleMedium'>{item.name}</Text>
                        </View>
                    </Pressable>
                }}
            /> : <ActivityIndicator animating />
        }
    </View>
}