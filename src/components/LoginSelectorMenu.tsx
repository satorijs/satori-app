import { Avatar, Menu, Text } from "react-native-paper";
import { useLogins } from "../globals/satori";
import { BotInfo, Login } from "../satori/protocol";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

export const LoginSelector = ({
    anchor,
    onSelect,
    current,
    logins
}: {
    anchor: React.ReactNode;
    onSelect: (info: Login) => void;
    current: Login | null;
    logins: Login[]
}) => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (logins && logins.length > 0 && !current) {
            onSelect(logins[0])
        }

        if (logins && !logins.some(login => login.selfId === current?.selfId &&
            login.platform === current?.platform)) {
            onSelect(logins[0])
        }
    }, [logins, current])

    return (
        <Menu
            anchor={
                <Pressable onPress={() => {
                    console.log('press')
                    setVisible(true)
                }}>
                    {anchor}
                </Pressable>
            }
            visible={visible}
            onDismiss={() => {
                setVisible(false)
            }}
        >
            {
                logins?.map((login) => {
                    return <Menu.Item
                        key={login.selfId}
                        onPress={() => {
                            onSelect(login)
                            setVisible(visible => !visible)
                        }}
                        title={login.user.name ?? login.selfId}
                        leadingIcon={
                            () => <Avatar.Image size={24} source={{ uri: login.user.avatar }} />
                        }
                        disabled={login.selfId === current?.selfId && login.platform === current?.platform}
                    />
                })
            }
        </Menu>
    );
}