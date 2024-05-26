import { NavigationProp } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { create } from "zustand";

export type StackParamList = {
    Login: undefined;
    Main: undefined;
    Chat: {
        channelId: string;
        guildId: string;
        channelName: string;
        guildName: string;
        avatar: string;
        platform: string;
    },
    Contact: {
        id: string;
        name: string;
        avatar: string;
        platform: string;
    },
    Test: undefined;
    Debug: undefined;
    Webview: {
        url: string;
    };
    
    ConnectToSatori: undefined;
    ConnectToDiscord: undefined;

    ChannelSelect: {
        guildId: string;
        guildName: string;
        avatar: string;
    }
}

export const Stack = createNativeStackNavigator<StackParamList>();

export const useGlobalStackNavigation = create<{
    navigation: NavigationProp<StackParamList>;
    setNavigation: (navigation: NavigationProp<StackParamList>) => void;
}>(set => ({
    navigation: null,
    setNavigation: (navigation) => set({ navigation })
}))