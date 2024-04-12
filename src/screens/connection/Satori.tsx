import { ActivityIndicator, Alert, Text, View } from "react-native"
import { useSatoriConnectionInfo } from "../../globals/satori"
import { memo, useEffect, useState } from "react";
import { Button, IconButton, MD3Colors, TextInput } from 'react-native-paper';
import { ConnectionInfo } from "../../satori/connection";
import { createAPI } from "../../satori/protocol";
import { CommonActions, NavigationProp } from "@react-navigation/native";
import { Stack, StackParamList } from "../../globals/navigator";
import React from "react";

const Input = ((props: { label: string, value: string, onChange: (value: string) => void }) => {
    return <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 3 }}>
        <TextInput
            label={props.label}
            style={{ flex: 1 }}
            onChangeText={props.onChange}
            value={props.value}
            mode="outlined"
        />
    </View>
});

const checkConnection = async (connection: ConnectionInfo) => {
    return createAPI(connection).getLogin().then(v => null).catch(e => e.message);
}

export const ConnectToSatori = ({ navigation }: {
    navigation: NavigationProp<StackParamList>
}) => {
    const [connection, setConnection, restored] = useSatoriConnectionInfo();

    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        if (restored)
            checkConnection(connection).then(error => {
                console.log('connect', error, error === null);
                if (error === null) {
                    navigation.dispatch(CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Main' }]
                    }))
                }
            });
    }, [restored]);

    if (!restored) return <ActivityIndicator size="large" color="#0000ff" />
    return <View style={{ flex: 1, alignItems: 'flex-start', marginHorizontal: 40 }}>
        <Text style={{
            fontSize: 40,
            marginTop: 100,
            fontWeight: '800',
        }}>
            Satori Protocol
        </Text>
        <Text
            style={{
                fontSize: 20,
                marginTop: 10,
                marginBottom: 20,
            }}
        >Connect / 连接</Text>

        <Input label="Server" value={connection.server} onChange={(value) => setConnection({ ...connection, server: value })} />
        <Input label="Token" value={connection.token} onChange={(value) => setConnection({ ...connection, token: value })} />
        <Input label="Platform" value={connection.platform} onChange={(value) => setConnection({ ...connection, platform: value })} />
        <Input label="ID" value={connection.id} onChange={(value) => setConnection({ ...connection, id: value })} />

        <View style={{ flexDirection: 'row', marginTop: 20 }}>
            <Button mode='contained' style={{
                flex: 1
            }}
                onPress={async () => {
                    console.log('connect');
                    setConnecting(true);
                    const error = await checkConnection(connection);
                    setConnecting(false);
                    console.log('connect', error);
                    if (error === null) {
                        setConnection(connection);
                        navigation.dispatch(CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'Main' }]
                        }))
                    } else {
                        Alert.alert('Connection failed', error);
                    }
                }}
                disabled={!connection.server || !connection.token || !connection.platform || !connection.id || connecting}
            >
                {connecting ? <ActivityIndicator size="small" color="#ffffff" style={{
                    margin: 100
                }} /> : 'Connect'}
            </Button>
        </View>
    </View>
}