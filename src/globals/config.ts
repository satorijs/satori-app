import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { create } from "zustand";

interface Config {

}

const defaultConfig: Config = {

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
                setConfig({})
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
    const { config, setConfig } = useConfig(e=>e.config?.[key])
    return [config, setConfig] as [Config[T], (value: Config[T]) => void]
}