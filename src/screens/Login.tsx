import { ActivityIndicator, Alert, Text, ToastAndroid, View } from "react-native"
import { useSatoriConnectionInfo } from "../globals/satori"
import { memo, useEffect, useState } from "react";
import { Button, Card, Icon, IconButton, MD3Colors, TextInput } from 'react-native-paper';
import { ConnectionInfo } from "../satori/connection";
import { createAPI } from "../satori/protocol";
import { CommonActions, NavigationProp } from "@react-navigation/native";
import { Stack, StackParamList } from "../globals/navigator";
import React from "react";

const ConnectCard = memo(({
    onPress,
    name,
    icon,
    description,
    disabled = false,
}: {
    onPress: () => void,
    name: string,
    icon: string,
    description: string,
    disabled?: boolean,
}) => {
    return <Card style={{
        flexDirection: 'row',
        marginBottom: 20,
        padding: 20,
        width: '100%',
        opacity: disabled ? 0.6 : 1,
        shadowOpacity: disabled ? 0 : 0.2,
    }}
        disabled={disabled}
        onPress={onPress}>
        <View style={{
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center'
        }} aria-disabled={disabled}>
            <View>
                <Icon source={icon} size={30} />
            </View>
            <View>
                <Text style={{
                    fontSize: 22,
                    fontWeight: '600',
                }}>{name}</Text>
                <Text style={{
                    fontSize: 13,
                    color: MD3Colors.neutral40,
                }}>{description}</Text>
            </View>
        </View>
    </Card>
})

const checkConnection = async (connection: ConnectionInfo) => {
    return createAPI(connection).getLogin().then(v => null).catch(e => e.message);
}

export const Login = ({ navigation }: {
    navigation: NavigationProp<StackParamList>
}) => {
    const [connection, setConnection, restored] = useSatoriConnectionInfo();

    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        checkConnection(connection).then(error => {
            if (error === null) {
                navigation.dispatch(CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Main' }]
                }))
            }
        });
    }, []);

    if (!restored) return <ActivityIndicator size="large" color="#0000ff" />
    return <View style={{ flex: 1, alignItems: 'flex-start', marginHorizontal: 40 }}>
        <Text style={{
            fontSize: 40,
            marginTop: 100,
            fontWeight: '800',
        }}>
            Satori App
        </Text>
        <Text
            style={{
                fontSize: 20,
                marginTop: 10,
                marginBottom: 20,
            }}
        >Connect / 连接</Text>

        <ConnectCard
            onPress={() => {
                navigation.navigate('ConnectToSatori')
            }}
            name="Satori"
            icon="cloud"
            description="连接至远程 Satori (App) Server"
        />

        <ConnectCard
            onPress={() => {
                ToastAndroid.show('未完成', ToastAndroid.SHORT)
            }}
            name="Onebot"
            icon="qqchat"
            description="连接至 Onebot11 协议"
            disabled
        />

        <ConnectCard
            onPress={() => {
                ToastAndroid.show('未完成', ToastAndroid.SHORT)
            }}
            name="Telegram"
            icon="send"
            description="连接至 Telegram 用户/Bot"
            disabled
        />

        <ConnectCard
            onPress={() => {
                ToastAndroid.show('未完成', ToastAndroid.SHORT)
            }}
            name="Discord"
            icon="discord"
            description="连接至 Discord 用户/Bot"
            disabled
        />
    </View>
}