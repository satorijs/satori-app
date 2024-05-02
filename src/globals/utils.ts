import { useEffect, useMemo, useRef, useState } from "react";

export const useAsyncIterator = <T>(asyncIterator?: (() => AsyncIterable<T>) | AsyncIterable<T>) => {
    const [values, setValues] = useState<T[]>([]);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const iterator = useMemo(() => {
        if (!asyncIterator) {
            return {
                next: async () => ({ done: true, value: undefined })
            };
        }
    
        if (typeof asyncIterator === 'function') {
            return asyncIterator()[Symbol.asyncIterator]();
        }
        return asyncIterator[Symbol.asyncIterator]();
    }, [asyncIterator]);

    const lock = useRef(false);
    const next = async () => {
        if (lock.current || done) return;
        lock.current = true;
        try {
            const { done, value } = await iterator.next();
            lock.current = false;
            if (done) {
                setDone(true);
            } else {
                setValues([...values, value]);
            }
        } catch (e) {
            setError(e);
            setDone(true);
            return;
        }
    };

    useEffect(()=>{
        next()
    }, [iterator])

    return {
        values,
        done,
        error,
        next
    };
}