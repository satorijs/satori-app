import { Avatar, Menu, Text } from "react-native-paper";
import { useLogins } from "../globals/satori";
import { BotInfo } from "../satori/protocol";

export const LoginSelector = ({
    anchor,
    visible,
    onDismiss,
    onSelect,
    current,
}: {
    anchor: React.ReactNode;
    visible: boolean;
    onDismiss: () => void;
    onSelect: (info: BotInfo) => void;
    current: BotInfo | null;
}) => {
    const logins = useLogins()

    return (
        <Menu
            visible={visible}
            onDismiss={onDismiss}
            anchor={anchor}
        >
            {
                logins?.map((login) => {
                    return <Menu.Item
                        key={login.selfId}
                        onPress={() => {
                            onSelect({
                                selfId: login.selfId,
                                platform: login.platform,
                            })
                            onDismiss()
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