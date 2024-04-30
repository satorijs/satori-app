import { ActivityIndicator, Alert, Text, View } from "react-native"
import { useSatori } from "../../globals/satori"
import { memo, useEffect, useState } from "react";
import { Button, IconButton, MD3Colors, TextInput } from 'react-native-paper';
import { ConnectionInfo } from "../../satori/connection";
import { createAPI } from "../../satori/protocol";
import { CommonActions, NavigationProp } from "@react-navigation/native";
import { Stack, StackParamList } from "../../globals/navigator";
import React from "react";
import { usePersistStorage } from "react-native-use-persist-storage";

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

export const ConnectToDiscord = ({ navigation }: {
    navigation: NavigationProp<StackParamList>
}) => {
    const [connection, setConnection, restored] = usePersistStorage<{
        token: string,
    }>('@dcconnectionInfo', { token: '' })

    const [connecting, setConnecting] = useState(false);

    const satori = useSatori();

    const login = () => satori.bot().appLogin('discord', {
        token: connection.token,
    })


    if (!restored) return <ActivityIndicator size="large" color="#0000ff" />
    return <View style={{ flex: 1, alignItems: 'flex-start', marginHorizontal: 40 }}>
        <Text style={{
            fontSize: 40,
            marginTop: 100,
            fontWeight: '800',
        }}>
            Discord
        </Text>
        <Text
            style={{
                fontSize: 20,
                marginTop: 10,
                marginBottom: 20,
            }}
        >Connect / 连接</Text>


        <Input label="Token" value={connection.token} onChange={(value) => setConnection({ ...connection, token: value })} />

        <View style={{ flexDirection: 'row', marginTop: 20 }}>
            <Button mode='contained' style={{
                flex: 1
            }}
                onPress={async () => {
                    console.log('connect');
                    setConnecting(true);
                    login().catch(error => {
                        setConnecting(false);
                        Alert.alert('Error', error.message);
                    }).then(() => {
                        setConnecting(false);
                        navigation.dispatch(CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'Main' }]
                        }))
                    })
                }}
                disabled={!connection.token || connecting}
            >
                {connecting ? <ActivityIndicator size="small" color="#ffffff" style={{
                    margin: 100
                }} /> : 'Connect'}
            </Button>
        </View>
    </View>
}