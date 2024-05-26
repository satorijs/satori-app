import { usePersistStorage } from "react-native-use-persist-storage";
import { ConnectionInfo, SatoriConnection, defaultConnectionInfo, validateConnectionInfo } from "../satori/connection";
import { create } from "zustand";
import { Event as SatoriEvent, Login, asyncIterToArr, Channel } from "../satori/protocol";
import { useEffect } from "react";
import { Contact } from "../satori/sas";

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
            server: '192.168.31.246:6140/satori',
            platform: 'discord',
            id: 'microblock.cc',
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
    return satori?.logins
}

export const initUseLogins = () => {
    
}


export const useContactInfo = create<{
    contactInfo: Contact[],
    setContactInfo: (contactInfo: Contact[]) => void
}>((set, get) => ({
    contactInfo: [],
    setContactInfo: (contactInfo: any) => set({ contactInfo })
}))