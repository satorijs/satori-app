import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type StackParamList = {
    Login: undefined;
    Main: undefined;
    Chat: {
        channelId: string;
        guildId: string;
        name: string;
        avatar: string;
    }
}

export const Stack = createNativeStackNavigator<StackParamList>();