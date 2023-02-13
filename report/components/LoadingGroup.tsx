import { createContext, useCallback, useEffect, useState } from "react";
import { InView } from "react-intersection-observer";

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

// resolve based on the rules above
const resolveStates = (states: BlockState[]): BlockState => {
    const anyError = states.some((s) => s === "error");
    const allReady = states.every((s) => s === "ready");
    const anyProcessing = states.some((s) => s === "processing");

    if (anyError) return "error";
    if (allReady) return "ready";
    if (anyProcessing) return "processing";
    return "waiting";
};

export const LoadingGroup = (props: { children: any }) => {
    const store = getBlockStore();
    const [requests, setRequests] = useState<Req[]>([]);
    const [state, setState] = useState<BlockState>("waiting");

    const enable = useCallback((request: Req) => setRequests((R) => [...R, request]), []);
    const disable = useCallback((request: Req) => setRequests((R) => R.filter((r) => r !== request)), []);

    useEffect(() => {
        const updateState = () => {
            const states = requests.map((req) => store.getStoredStatus(req).state);
            setState(resolveStates(states));
        };

        requests.forEach((req) => {
            store.enable(req);
            store.subscribe(req, updateState);
        });

        return () => {
            requests.forEach((req) => {
                store.unsubscribe(req, updateState);
                store.disable(req);
            });
        };
    }, [requests]);

    const onChange = (inView: boolean) => requests.forEach((req) => store[inView ? "enable" : "disable"](req));

    return (
        <InView onChange={onChange} fallbackInView={true}>
            <LoadingContext.Provider value={{ enable, disable }}>
                <fieldset style={{ margin: "revert", padding: "revert", border: "revert" }}>
                    <legend>
                        LOADING GROUP ({requests.map((r) => JSON.stringify(r)).join(",")}): {state}
                    </legend>
                    {props.children}
                </fieldset>
            </LoadingContext.Provider>
        </InView>
    );
};
