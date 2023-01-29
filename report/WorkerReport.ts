import { DateKey, Day, genTimeKeys } from "@pipeline/Time";
import { Index } from "@pipeline/Types";
import { BlockDescriptions, BlockInfo, BlockKey, Blocks, CommonBlockData } from "@pipeline/aggregate/Blocks";
import { Filters } from "@pipeline/aggregate/Filters";
import { decompress } from "@pipeline/compression/Compression";
import { Database } from "@pipeline/process/Types";
import { matchFormat } from "@pipeline/process/nlp/Text";
import { FormatCache } from "@report/DataProvider";

export interface InitMessage {
    type: "init";
    dataStr: string;
}

export interface ReadyMessage {
    type: "ready";
    database: Database;
    blocksDescs: BlockDescriptions;
    formatCache: FormatCache;
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
    console.time("Decompress time");
    database = decompress(msg.dataStr);
    console.timeEnd("Decompress time");
    filters = new Filters(database);
    common = {
        timeKeys: genTimeKeys(Day.fromKey(database.time.minDate), Day.fromKey(database.time.maxDate)),
    };

    console.time("Build format cache");
    const formatCache = {
        authors: database.authors.map((author) => matchFormat(author.n)),
        channels: database.channels.map((channel) => matchFormat(channel.name)),
        words: database.words.map((word) => matchFormat(word)),
        emojis: database.emojis.map((emoji) => matchFormat(emoji.n)),
        mentions: database.mentions.map((mention) => matchFormat(mention)),
    };
    console.timeEnd("Build format cache");

    const message: ReadyMessage = {
        type: "ready",
        database: {
            ...database,
            // no needed in the UI
            serialized: undefined,
        },
        formatCache,
        // remove functions
        blocksDescs: JSON.parse(JSON.stringify(Blocks)) as BlockDescriptions,
    };

    self.postMessage(message);

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
