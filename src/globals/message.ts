import { useEffect } from "react";
import { usePersistStorage } from "react-native-use-persist-storage";
import { create } from "zustand";

export const _useMessageStore = () => usePersistStorage(`@messageStore`, () => ([]))
export const zus_useMsgStore = create<{
    val: any,
    set: (v: any) => void
}>(set => {
    return {
        val: {},
        set(v) {
            set({ val: v })
        }
    }
})

export const useMessageStore = ()=>{
    const [val2, set2] = _useMessageStore()
    const {val, set} = zus_useMsgStore();

    useEffect(()=>{
        console.log('set')
        set(val2)
    }, [val2])

    return [val, (v)=>{
        set2(v)
        set(v)
    }]
}