import { Database, Index } from "@pipeline/Types";
import { Blocks, BlockDescriptions, BlockKey, BlockInfo, CommonBlockData } from "@pipeline/aggregate/Blocks";
import { Filters } from "@pipeline/aggregate/Filters";
import { decompress } from "@pipeline/compression/Compression";
import { DateKey, Day, genTimeKeys } from "@pipeline/Time";

export interface InitMessage {
    type: "init";
    dataStr: string;
}

export interface ReadyMessage {
    type: "ready";
    database: Database;
    blocksDescs: BlockDescriptions;
}

export interface BlockRequestMessage {
    type: "request";
    blockKey: BlockKey;
    filters: Partial<{
        authors: Index[];
        channels: Index[];
        startDate: DateKey;
        endDate: DateKey;
    }>;
}

export interface BlockResultMessage<K extends BlockKey> {
    type: "result";
    blockKey: K;
    blockInfo: BlockInfo<K>;
}

let database: Database | null = null;
let filters: Filters | null = null;
let common: CommonBlockData | null = null;

const init = (msg: InitMessage) => {
    database = decompress(msg.dataStr);
    filters = new Filters(database);
    common = {
        timeKeys: genTimeKeys(Day.fromKey(database.time.minDate), Day.fromKey(database.time.maxDate)),
    };

    self.postMessage(<ReadyMessage>{
        type: "ready",
        database: {
            ...database,
            // no needed in the UI
            serialized: undefined,
        },
        // remove functions
        blocksDescs: JSON.parse(JSON.stringify(Blocks)) as BlockDescriptions,
    });

    if (env.isDev) console.log(database);
};

const request = async (msg: BlockRequestMessage) => {
    if (!database || !filters || !common) throw new Error("No data provided");

    // update active data if provided
    if (msg.filters.channels) filters.updateChannels(msg.filters.channels);
    if (msg.filters.authors) filters.updateAuthors(msg.filters.authors);
    if (msg.filters.startDate) filters.updateStartDate(msg.filters.startDate);
    if (msg.filters.endDate) filters.updateEndDate(msg.filters.endDate);

    const result: BlockResultMessage<any> = {
        type: "result",
        blockKey: msg.blockKey,
        blockInfo: {
            state: "error",
            data: null,
        },
    };

    try {
        if (!(msg.blockKey in Blocks)) throw new Error("BlockFn not found");

        console.time(msg.blockKey);
        const data = Blocks[msg.blockKey].fn(database, filters, common);
        console.timeEnd(msg.blockKey);

        result.blockInfo = {
            state: "ready",
            data,
        };
    } catch (err) {
        console.error(err);
    }

    self.postMessage(result);
};

self.onmessage = (ev: MessageEvent<InitMessage | BlockRequestMessage>) => {
    switch (ev.data.type) {
        case "init":
            init(ev.data);
            break;
        case "request":
            request(ev.data);
            break;
        default:
            console.log("Unknown message", ev.data);
    }
};

console.log("WorkerReport started");
