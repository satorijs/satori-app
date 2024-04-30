import { usePersistStorage } from "react-native-use-persist-storage";
import { ConnectionInfo, SatoriConnection, defaultConnectionInfo, validateConnectionInfo } from "../satori/connection";
import { create } from "zustand";
import { Event as SatoriEvent, Login, asyncIterToArr } from "../satori/protocol";
import { useEffect } from "react";

const _useSatoriConnection = create<{
    connection: SatoriConnection | null,
    setConnection: (connection?: SatoriConnection) => void
}>((set, get) => ({
    connection: null,
    setConnection: (connection: any) => set({ connection })
}))

export const useSatori = () => {
    const { connection, setConnection } = _useSatoriConnection()
    if (connection === null) {
        setConnection(new SatoriConnection({
            https: false,
            server: '192.168.31.246:3453',
            platform: '0',
            id: '0',
            token: '0'
        }))
    }
    return connection
}

const _useLogin = create<{
    login: Login[] | null,
    setLogin: (login: Login[]) => void
}>((set, get) => ({
    login: null,
    setLogin: (login: any) => set({ login })
}))

export const useLogins = () => {
    const satori = useSatori()
    const { login, setLogin } = _useLogin()
    useEffect(() => {
        if (satori === null || login !== null) return
        console.log('get login')
        asyncIterToArr(satori.bot().getLoginIter()).then(v => {
            console.log('get login', v)
            setLogin(v)
        })
    }, [satori])



    return login
}

export const initUseLogins = () => {
    const satori = useSatori()
    const { login, setLogin } = _useLogin()
    useEffect(() => {
        if (satori === null) return
        const l = satori.addListener('message', (evt: SatoriEvent) => {
            console.log('message', evt.type)
            if (evt.type === 'login-added') {
                asyncIterToArr(satori.bot().getLoginIter()).then(v => {
                    console.log('get login', v)
                    setLogin(v)
                })
            }
        })

        return () => {
            console.log('remove listener')
            l.remove()
        }
    }, [satori])
}