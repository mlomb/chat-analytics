export default null as any;

import { BlockKey, BlockState, BlockProcessFns } from "@pipeline/blocks/Blocks";
import { ID, ProcessedData } from "@pipeline/preprocess/ProcessedData";

export interface SourceData {
    type: "source-data";
    blockKey: BlockKey;
}

export interface FilterUpdate {
    type: "filter-update";
    activeChannels?: ID[];
    activeAuthors?: ID[];
    activeStartDate?: Date;
    activeEndDate?: Date;
}

export interface BlockRequest {
    type: "block-request";
    blockKey: BlockKey;
}

export interface BlockResult {
    blockKey: BlockKey;
    state: BlockState;
    data: any | null;
}

const source: ProcessedData | null = null;
const activeChannels: ID[] = [];
const activeAuthors: ID[] = [];
const activeStartDate: Date = new Date();
const activeEndDate: Date = new Date();

self.onmessage = async (ev: MessageEvent<BlockRequest>) => {
    console.log(ev.data);

    await new Promise((resolve) => setTimeout(resolve, Math.random() * 700 + 150 + 1000));

    if (ev.data.blockKey in BlockProcessFns) {
        const data = BlockProcessFns[ev.data.blockKey](source!);

        self.postMessage(<BlockResult>{
            blockKey: ev.data.blockKey,
            state: "ready",
            data,
        });
    } else {
        self.postMessage(<BlockResult>{
            blockKey: ev.data.blockKey,
            state: "error",
            data: null,
        });
    }
};

console.log("WorkerReport started");
