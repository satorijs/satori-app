import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type StackParamList = {
    Login: undefined;
    Main: undefined;
    Chat: {
        channelId: string;
        guildId: string;
        name: string;
        avatar: string;
    },

    
    ConnectToSatori: undefined;
}

export const Stack = createNativeStackNavigator<StackParamList>();