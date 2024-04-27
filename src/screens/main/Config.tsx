import { View, Text } from "react-native"
import { List } from "react-native-paper"
import { useGlobalStackNavigation } from "../../globals/navigator"

export const Config = () => {
    const { navigation } = useGlobalStackNavigation()

    return <View style={{
        marginHorizontal: 30,
        marginVertical: 30,
        flex: 1
    }}>
        <Text style={{
            fontSize: 40,
            marginTop: 60,
            fontWeight: '500',
            marginBottom: 30
        }}>
            设置
        </Text>
        <List.Item
            left={()=><List.Icon icon='account' />}
            onPress={()=>{
                navigation.navigate('Login')
            }}
            title="登录新账号" />

    </View>
}