import { useContext, useEffect, useState } from "react";

import { BlockArgs, BlockKey } from "@pipeline/aggregate/Blocks";

import { getBlockStore } from "./BlockStore";
import { BlockState } from "./WorkerReport";
import { LoadingContext } from "./components/LoadingGroup";

/**
 *
 */
export const useBlockData = <K extends BlockKey>(key: K, args?: BlockArgs<K>): any => {
    const store = getBlockStore();
    const [data, setData] = useState<any | undefined>();
    const { addKey, rmKey } = useContext(LoadingContext);

    useEffect(() => {
        const ls = (data: any) => setData(data);

        store.on(`data-${key}`, ls);
        addKey(key);
        return () => {
            store.off(`data-${key}`, ls);
            rmKey(key);
        };
    }, [key]);

    return data;
};

/**
 * Combines the state of the keys provided based on the following rules:
 * - If ANY of the keys are in the `error` state, `error` is returned
 * - If ALL of the keys are in the `ready` state, `ready` is returned
 * - If ANY of the keys are in the `processing` state, `processing` is returned
 * - else `waiting` is returned
 *
 * The state will be updated automatically
 */
export const useBlockState = (keys: BlockKey[]): BlockState => {
    const store = getBlockStore();
    const [state, setState] = useState<BlockState>("waiting");

    // resolve based on the rules above
    const resolve = (states: BlockState[]): BlockState => {
        const anyError = states.some((s) => s === "error");
        const allReady = states.every((s) => s === "ready");
        const anyProcessing = states.some((s) => s === "processing");

        if (anyError) return "error";
        if (allReady) return "ready";
        if (anyProcessing) return "processing";
        return "waiting";
    };

    useEffect(() => {
        const status: BlockState[] = new Array(keys.length);
        const offFns: any[] = [];

        for (let i = 0; i < keys.length; i++) {
            const index = i;
            const ls = (state: BlockState) => {
                status[index] = state;
                setState(resolve(status));
            };

            // retrieve the current state
            status[index] = store.getState(keys[i]);

            // subscribe and store the unsubscribe function
            const key = keys[i];
            store.on(`state-${key}`, ls);
            offFns.push(() => store.off(`state-${key}`, ls));
        }

        // set the initial state
        setState(resolve(status));

        return () => offFns.forEach((fn) => fn());
    }, [keys]);

    console.log(keys, state);

    return state;
};
