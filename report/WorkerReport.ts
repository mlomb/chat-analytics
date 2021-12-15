export default null as any;

import { BlockKey, BlocksDesc, BlocksDescMap, BlocksProcessFn, BlockState, Filters } from "@pipeline/blocks/Blocks";
import { ProcessedData } from "@pipeline/preprocess/ProcessedData";

export interface BlockRequest {
    blockKey: BlockKey;
    processedData?: ProcessedData;
    filters: Partial<Filters>;
}

export interface BlockResult {
    type: "result";
    blockKey: BlockKey;
    state: BlockState;
    data: any | null;
}

export interface BlocksInfo {
    type: "info";
    info: BlocksDescMap;
}

let processedData: ProcessedData | null = null;
let fitlers: Filters = {
    channels: [],
    channelsSet: new Set(),
    authors: [],
    authorsSet: new Set(),
    startDate: "",
    endDate: "",
};

self.onmessage = async (ev: MessageEvent<BlockRequest>) => {
    const br: BlockRequest = ev.data;

    // update active data if provided
    if (br.processedData) processedData = br.processedData;
    if (br.filters.channels) {
        fitlers.channels = br.filters.channels;
        fitlers.channelsSet = new Set(br.filters.channels);
    }
    if (br.filters.authors) {
        fitlers.authors = br.filters.authors;
        fitlers.authorsSet = new Set(br.filters.authors);
    }
    if (br.filters.startDate) fitlers.startDate = br.filters.startDate;
    if (br.filters.endDate) fitlers.endDate = br.filters.endDate;

    try {
        if (!processedData) throw new Error("No processed data provided");
        if (!(br.blockKey in BlocksProcessFn)) throw new Error("BlockFn not found");

        const data = BlocksProcessFn[br.blockKey](processedData, fitlers);

        self.postMessage(<BlockResult>{
            type: "result",
            blockKey: br.blockKey,
            state: "ready",
            data,
        });
    } catch (err) {
        // console.error(err);
        self.postMessage(<BlockResult>{
            type: "result",
            blockKey: br.blockKey,
            state: "error",
            data: null,
        });
    }
};

console.log("WorkerReport started");

// send initial information about blocks
self.postMessage(<BlocksInfo>{
    type: "info",
    info: BlocksDesc,
});
