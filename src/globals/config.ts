import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { create } from "zustand";

interface Config {
    mergeMessage: boolean;
    avatarType: 'full' | 'first' | 'none';
    bubbleType: 'material' | 'none';
}

const defaultConfig: Config = {
    mergeMessage: true,
    avatarType: 'first',
    bubbleType: 'material'
}

export const useConfig = create<{
    config: Config | null,
    setConfig: (config: Config) => void
}>(set => ({
    config: null,
    setConfig: config => set({ config })
}))

let flagFirst = true
export const initConfigStore = () => {
    const { setConfig, config } = useConfig()
    useEffect(() => {
        AsyncStorage.getItem('config').then(value => {
            if (value) {
                setConfig(JSON.parse(value))
            } else {
                setConfig(defaultConfig)
            }
        })
    }, [])

    useEffect(() => {
        if (config === null) return
        if (flagFirst) {
            flagFirst = false
            return
        }
        AsyncStorage.setItem('config', JSON.stringify(config))
    }, [config])
}

export const useConfigKey = <T extends keyof Config>(key: T) => {
    return useConfig(e => [e.config?.[key] ?? defaultConfig[key],
    (value: Config[T]) => {
        e.setConfig({
            ...e.config,
            [key]: value
        })
    }
    ] as const)
}