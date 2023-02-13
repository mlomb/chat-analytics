import { useContext, useEffect, useState } from "react";

import { BlockArgs, BlockData, BlockKey } from "@pipeline/aggregate/Blocks";
import { BlockStatus, getBlockStore, idRequest } from "@report/BlockStore";
import { BlockRequest } from "@report/WorkerReport";
import { LoadingContext } from "@report/components/LoadingGroup";

/**
 * Hook to subscribe to block data updates.
 * Note that this hook alone will not fire the block computation,
 * you have to wrap it in a @see LoadingGroup component.
 */
export const useBlockData = <K extends BlockKey>(blockKey: K, args?: BlockArgs<K>): BlockData<K> | undefined => {
    const store = getBlockStore();
    const request: BlockRequest<K> = { blockKey, args };

    const [data, setData] = useState<BlockData<K> | undefined>(store.getStoredStatus(request)?.data);
    const ctx = useContext(LoadingContext);
    if (!ctx) throw new Error("useBlockData must be used inside a LoadingGroup component");

    useEffect(() => {
        const updateData = (status: BlockStatus<K>) => {
            // only update data if the new one is not undefined
            // so we keep displaying previous data until the new one is ready
            if (status.data !== undefined) setData(status.data);
        };

        store.subscribe(request, updateData);
        ctx.enable(request);

        return () => {
            store.unsubscribe(request, updateData);
            ctx.disable(request);
        };
    }, [idRequest(request)]);

    return data;
};
