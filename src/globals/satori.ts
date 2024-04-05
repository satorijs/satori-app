import { usePersistStorage } from "react-native-use-persist-storage";
import { ConnectionInfo, SatoriConnection, defaultConnectionInfo, validateConnectionInfo } from "../satori/connection";
import { create } from "zustand";
import { Login } from "../satori/protocol";
import { useEffect } from "react";

export const useSatoriConnectionInfo = () => usePersistStorage('@connectionInfo', () => defaultConnectionInfo, {
    sensitive: {}
})

const _useSatoriConnection = create<{
    connection: SatoriConnection | null,
    setConnection: (connection?: SatoriConnection) => void
}>((set, get) => ({
    connection: null,
    setConnection: (connection: any) => set({ connection })
}))

export const useSatori = () => {
    const [info] = useSatoriConnectionInfo()
    const { connection, setConnection } = _useSatoriConnection()
    if (connection === null && validateConnectionInfo(info)) {
        setConnection(new SatoriConnection(info))
    }
    return connection
}

const _useLogin = create<{
    login: Login | null,
    setLogin: (login: Login) => void
}>((set, get) => ({
    login: null,
    setLogin: (login: any) => set({ login })
}))

export const useLogin = () => {
    const satori = useSatori()
    const { login, setLogin } = _useLogin()
    useEffect(() => {
        if (satori === null) return
        console.log('get login')
        satori.bot.getLogin().then(v => {
            console.log('get login', v)
            setLogin(v)

        })
    }, [satori])

    return login
}