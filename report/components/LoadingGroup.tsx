import { ReactNode, createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

import { BlockKey } from "@pipeline/aggregate/Blocks";
import { BlockState, getBlockStore } from "@report/BlockStore";
import { BlockRequest } from "@report/WorkerReport";

export const LoadingContext = createContext<LoadingContextValue>(null!);

// shorthand for this file only
type Req = BlockRequest<BlockKey>;

interface LoadingContextValue {
    // we expect the request object passed to disable
    // to be the same instance as the one passed to enable
    // (comparing with ===)
    enable: (request: Req) => void;
    disable: (request: Req) => void;
}

/**
 * Combines the states provided based on the following rules:
 * - If ANY state is `error`, `error` is returned
 * - If ALL states are `ready`, `ready` is returned
 * - If ANY state is `processing`, `processing` is returned
 * - else `waiting` is returned
 */
const combineStates = (states: BlockState[]): BlockState => {
    const anyError = states.some((s) => s === "error");
    const allReady = states.every((s) => s === "ready");
    const anyProcessing = states.some((s) => s === "processing");

    if (anyError) return "error";
    if (allReady) return "ready";
    if (anyProcessing) return "processing";
    return "waiting";
};

/**
 * Wraps a component which receives a combined BlockState for all block requests inside its children.
 * It enables the computation of those block requests.
 */
export const LoadingGroup = (props: { children: (state: BlockState) => ReactNode }) => {
    const store = getBlockStore();
    const [requests, setRequests] = useState<Req[]>([]);
    const [_, rerender] = useState(0);
    const { inView, ref } = useInView({
        threshold: 0,
        fallbackInView: true,
    });

    // ctx
    const enable = useCallback((request: Req) => setRequests((R) => [...R, request]), []);
    const disable = useCallback((request: Req) => setRequests((R) => R.filter((r) => r !== request)), []);
    const ctxValue: LoadingContextValue = useMemo(() => ({ enable, disable }), [enable, disable]);

    useEffect(() => {
        if (inView === false) return;

        // enable in store
        requests.forEach((req) => store.enable(req));

        // disable in store
        return () => requests.forEach((req) => store.disable(req));
    }, [requests, inView]);

    useEffect(() => {
        const trigger = () => rerender(Math.random());

        // subscribe to all
        requests.forEach((req) => store.subscribe(req, trigger));

        // unsubscribe on unmount
        return () => requests.forEach((req) => store.unsubscribe(req, trigger));
    }, [requests]);

    const state = combineStates(requests.map((req) => store.getStoredStatus(req).state));

    return (
        <div ref={ref}>
            <LoadingContext.Provider value={ctxValue} children={props.children(state)} />
        </div>
    );
};
