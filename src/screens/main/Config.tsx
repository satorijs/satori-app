import { View, Text } from "react-native"
import { List } from "react-native-paper"
import { useGlobalStackNavigation } from "../../globals/navigator"
import { MaterialSwitchListItem } from "../../components/material-switch/MaterialSwitchListItem"
import { useConfigKey } from "../../globals/config"

export const Config = () => {
    const { navigation } = useGlobalStackNavigation()

    const [mergeMessage, setMergeMessage] = useConfigKey('mergeMessage')

    return <View style={{
        marginHorizontal: 20,
        marginVertical: 30,
        flex: 1
    }}>
        <Text style={{
            fontSize: 40,
            marginTop: 60,
            fontWeight: '500',
            marginBottom: 30,
            marginLeft: 10
        }}>
            设置
        </Text>
        <List.Item
            style={{
                marginLeft: 14
            }}
            left={()=><List.Icon icon='account' />}
            onPress={()=>{
                navigation.navigate('Login')
            }}
            title="登录新账号" />

        <MaterialSwitchListItem
            title="消息合并"
            description="合并连续的，同一用户发送的，相同内容的消息"
            selected={mergeMessage}
            onPress={() => {
                setMergeMessage(!mergeMessage)
            }}
            />
    </View>
}