import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { InView } from "react-intersection-observer";

import { useBlockState } from "@report/BlockHooks";

export const LoadingContext = createContext<any>(null);

export const LoadingGroup = (props: any) => {
    const [keys, setKeys] = useState<any>([]);
    const state = useBlockState(keys);
    const inViewRef = useRef<boolean>(false);

    const addKey = useCallback((key: string) => {
        setKeys((K: any) => {
            if (K.includes(key)) {
                return K;
            }
            return [...K, key];
        });
    }, []);
    const rmKey = useCallback((key: string) => {
        setKeys((K: any) => {
            return K.filter((k: string) => k !== key);
        });
    }, []);

    useEffect(() => {}, [keys]);
    const onChange = (inView: boolean) => {};

    return (
        <InView onChange={onChange} fallbackInView={true}>
            <LoadingContext.Provider value={{ addKey, rmKey }}>
                <fieldset style={{ margin: "revert", padding: "revert", border: "revert" }}>
                    <legend>
                        LOADING GROUP ({keys.join(",")}): {state}
                    </legend>
                    {props.children}
                </fieldset>
            </LoadingContext.Provider>
        </InView>
    );
};
