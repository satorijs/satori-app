import { View, Text } from "react-native"
import { List, Menu } from "react-native-paper"
import { useGlobalStackNavigation } from "../../globals/navigator"
import { MaterialSwitchListItem } from "../../components/material-switch/MaterialSwitchListItem"
import { useConfigKey } from "../../globals/config"
import { useState } from "react"

const bubbleTypeMap = {
    'material': 'Material You',
    'none': '无'
}

const avatarTypeMap = {
    'full': '完整',
    'first': '首条消息',
    'none': '不显示'
}

const ListMenuItem = ({ defaultValue, setValue, values, title }: {
    defaultValue: string,
    setValue: (value: string) => void,
    values: {
        [key: string]: string
    },
    title?: string
}) => {
    const [visible, setVisible] = useState(false)
    const [value, setValue2] = useState(defaultValue)

    return <List.Item
        title={title}
        onPress={() => setVisible(true)}
        right={() => <Menu
            anchor={
                <Text>{values[value]}</Text>
            }
            anchorPosition="bottom"
            visible={visible}
            onDismiss={() => setVisible(false)}
        >
            {
                Object.entries(values).map(([key, value]) => {
                    return <Menu.Item
                        key={key}
                        onPress={() => {
                            setValue(key)
                            setValue2(key)
                            setVisible(false)
                        }}
                        title={value}
                    />
                })
            }
        </Menu>}
    />
}

export const Config = () => {
    const { navigation } = useGlobalStackNavigation()

    const [mergeMessage, setMergeMessage] = useConfigKey('mergeMessage')
    const [bubbleType, setBubbleType] = useConfigKey('bubbleType')
    const [avatarType, setAvatarType] = useConfigKey('avatarType')

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
            left={() => <List.Icon icon='account' />}
            onPress={() => {
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

        <ListMenuItem
            title="气泡样式"
            defaultValue={bubbleType}
            setValue={setBubbleType}
            values={bubbleTypeMap} />

        <ListMenuItem
            title="头像显示"
            defaultValue={avatarType}
            setValue={setAvatarType}
            values={avatarTypeMap} />

        <List.Item
            style={{
                marginLeft: 14
            }}
            left={() => <List.Icon icon='test-tube' />}
            onPress={() => {
                navigation.navigate('Test')
            }}
            title="组件测试页面" />
        <List.Item
            style={{
                marginLeft: 14
            }}
            left={() => <List.Icon icon='test-tube' />}
            onPress={() => {
                navigation.navigate('Debug')
            }}
            title="调试页" />
        <List.Item
            style={{
                marginLeft: 14
            }}
            left={() => <List.Icon icon='test-tube' />}
            onPress={() => {
                navigation.navigate('Webview', {
                    url: 'http://192.168.31.246:6140'
                })
            }}
            title="Satori 控制台" />
    </View>
}