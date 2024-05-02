import { NavigationProp } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { create } from "zustand";

export type StackParamList = {
    Login: undefined;
    Main: undefined;
    Chat: {
        channelId: string;
        guildId: string;
        name: string;
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
    
    ConnectToSatori: undefined;
    ConnectToDiscord: undefined;
}

export const Stack = createNativeStackNavigator<StackParamList>();

export const useGlobalStackNavigation = create<{
    navigation: NavigationProp<StackParamList>;
    setNavigation: (navigation: NavigationProp<StackParamList>) => void;
}>(set => ({
    navigation: null,
    setNavigation: (navigation) => set({ navigation })
}))