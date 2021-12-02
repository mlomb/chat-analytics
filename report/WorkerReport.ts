export default null as any;

import { BlockKey, BlockState, BlockProcessFns, Filters } from "@pipeline/blocks/Blocks";
import { ProcessedData } from "@pipeline/preprocess/ProcessedData";

export interface BlockRequest {
    blockKey: BlockKey;
    processedData?: ProcessedData;
    filters: Partial<Filters>;
}

export interface BlockResult {
    blockKey: BlockKey;
    state: BlockState;
    data: any | null;
}

let processedData: ProcessedData | null = null;
let fitlers: Filters = {
    channels: [],
    authors: [],
    startDate: new Date(),
    endDate: new Date(),
};

self.onmessage = async (ev: MessageEvent<BlockRequest>) => {
    const br: BlockRequest = ev.data;

    // update active data if provided
    if (br.processedData) processedData = br.processedData;
    if (br.filters.channels) fitlers.channels = br.filters.channels;
    if (br.filters.authors) fitlers.authors = br.filters.authors;
    if (br.filters.startDate) fitlers.startDate = br.filters.startDate;
    if (br.filters.endDate) fitlers.endDate = br.filters.endDate;

    try {
        if (!processedData) throw new Error("No processed data provided");
        if (!(br.blockKey in BlockProcessFns)) throw new Error("BlockFn not found");

        const data = BlockProcessFns[br.blockKey](processedData, fitlers);

        self.postMessage(<BlockResult>{
            blockKey: br.blockKey,
            state: "ready",
            data,
        });
    } catch (err) {
        console.error(err);
        self.postMessage(<BlockResult>{
            blockKey: br.blockKey,
            state: "error",
            data: null,
        });
    }
};

console.log("WorkerReport started");
