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
    const { enable, disable } = useContext(LoadingContext);

    useEffect(() => {
        const updateData = (status: BlockStatus<K>) => setData(status.data);

        store.subscribe(request, updateData);
        enable(request);

        return () => {
            store.unsubscribe(request, updateData);
            disable(request);
        };
    }, [idRequest(request)]);

    return data;
};
