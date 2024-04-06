import { useEffect } from "react";
import { createPersistContext, usePersistStorage } from "react-native-use-persist-storage";
import { create } from "zustand";

export const MessageStoreContext = createPersistContext({
    storageKey: `@messageStore`,
    defaultData: []
})

export const useMessageStoreSingle = () => usePersistStorage('@messageStoreSingle', () => [])

export const useMessageStore = MessageStoreContext.useData.bind(MessageStoreContext)
