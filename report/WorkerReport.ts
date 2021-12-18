export default null as any;

import { BlockKey, BlocksDesc, BlocksProcessFn, BlockState, Filters } from "@pipeline/blocks/Blocks";
import { ProcessedData } from "@pipeline/preprocess/ProcessedData";
import { decompress } from "@pipeline/shared/Compression";
import { Basic, computeBasic } from "@report/Basic";

// Receive compressed data
export interface InitMessage {
    type: "init";
    dataStr: string;
}

// Send required data for the UI
export interface ReadyMessage {
    type: "ready";
    basic: Basic;
    blocksDesc: typeof BlocksDesc;
}

export interface BlockRequestMessage {
    type: "request";
    blockKey: BlockKey;
    filters: Partial<Filters>;
}

export interface BlockResult {
    type: "result";
    blockKey: BlockKey;
    state: BlockState;
    data: any | null;
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

const init = async (msg: InitMessage) => {
    processedData = await decompress(msg.dataStr);
    self.postMessage(<ReadyMessage>{
        type: "ready",
        basic: computeBasic(processedData),
        blocksDesc: BlocksDesc,
    });

    console.log(processedData);
};

const request = async (msg: BlockRequestMessage) => {
    const br = msg;
    // update active data if provided
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

self.onmessage = async (ev: MessageEvent<InitMessage | BlockRequestMessage>) => {
    switch (ev.data.type) {
        case "init":
            init(ev.data);
            break;
        case "request":
            console.log("Req", ev.data);

            request(ev.data);
            break;
    }
};

console.log("WorkerReport started");
