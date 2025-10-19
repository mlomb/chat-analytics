import * as ReportWorkerType from "report_worker";

import { DateKey } from "@pipeline/Time";
import { Index } from "@pipeline/Types";
import { BlockArgs, BlockData, BlockKey, Filter } from "@pipeline/aggregate/Blocks";
import { CommonBlockData, computeCommonBlockData } from "@pipeline/aggregate/Common";
import { Filters } from "@pipeline/aggregate/Filters";
import { decompressDatabase } from "@pipeline/compression/Compression";
import { Database } from "@pipeline/process/Types";
import { matchFormat } from "@pipeline/process/nlp/Text";
import { FormatCache } from "@report/WorkerWrapper";

/** A request to compute a block */
export type BlockRequest<K extends BlockKey> = {
    blockKey: K;
    args: BlockArgs<K>;
};

/** The result of a block computation */
export type BlockResult<K extends BlockKey> = {
    success: boolean;
    triggers: Filter[];
    errorMessage?: string;
    data?: BlockData<K>;
};

/** Message sent from the UI to the worker to initialize the database (providing it encoded) */
export interface InitMessage {
    type: "init";
    dataStr: Uint8Array;
}

/** Message sent from the worker to the UI with the Database decoded and other information */
export interface ReadyMessage {
    type: "ready";
    database: Database;
    formatCache: FormatCache;
}

/**
 * Message sent from the UI to the worker to request a block computation.
 * It also updates the filters if they changed
 *
 * Note that only one block computation can be active at a time!
 */
export interface BlockRequestMessage {
    type: "request";
    request: BlockRequest<BlockKey>;
    filters: Partial<{
        authors: Index[];
        channels: Index[];
        startDate: DateKey;
        endDate: DateKey;
    }>;
}

/** Message sent from the worker to the UI with the result of a block computation */
export interface BlockResultMessage<K extends BlockKey> {
    type: "result";
    request: BlockRequest<K>;
    result: BlockResult<K>;
}

let database: Database | null = null;
let filters: Filters | null = null;
let common: CommonBlockData | null = null;

let module: typeof ReportWorkerType | null = null;

const init = (msg: InitMessage) => {
    console.log("Init message", msg);

    import("report_worker").then((m) => {
        module = m;
        module.init_panic_hook();
        console.log(msg.dataStr.byteLength);
        console.log(module.read_database(new Uint8Array(msg.dataStr)));

        const message: ReadyMessage = {
            type: "ready",
            database: {
                // since we don't need serialized messages in the UI
                // and since they are huge, let's remove them
                messages: undefined,

                time: {
                    minDate: "2025-01-25",
                    maxDate: "2025-01-30",
                },
                config: {
                    platform: "discord",
                },
                guilds: [
                    {
                        name: "asd",
                    },
                ],
                channels: [],
                authors: [],
                calls: [],
                words: [],
                emojis: [],
                domains: [],
                mentions: [],
            },
            formatCache: undefined,
        };

        self.postMessage(message);
    });

    return;

    ///

    console.time("Decompress time");
    database = decompressDatabase(msg.dataStr);
    console.timeEnd("Decompress time");

    console.time("Compute common block data");
    common = computeCommonBlockData(database);
    console.timeEnd("Compute common block data");

    filters = new Filters(database);

    console.time("Build format cache");
    // We don't want to stall the UI computing this, so we have to do it in the worker.
    // We could treat FormatCache as another block and manage it in the UI,
    // but it's too much trouble imo, just do it here
    const formatCache: FormatCache = {
        authors: database.authors.map((author) => matchFormat(author.n)),
        channels: database.channels.map((channel) => matchFormat(channel.name)),
        words: database.words.map((word) => matchFormat(word)),
        emojis: database.emojis.map((emoji) => matchFormat(emoji.name)),
        mentions: database.mentions.map((mention) => matchFormat(mention)),
    };
    console.timeEnd("Build format cache");

    const message: ReadyMessage = {
        type: "ready",
        database: {
            ...database,
            // since we don't need serialized messages in the UI
            // and since they are huge, let's remove them
            // @ts-expect-error
            messages: undefined,
        },
        formatCache,
    };

    self.postMessage(message);

    if (env.isDev) console.log(database);
};

const request = async (msg: BlockRequestMessage) => {
    console.log("BLOCK REQUEST:", msg);

    if (!module) throw new Error("Module not initialized");

    const request = msg.request;
    const resultMsg: BlockResultMessage<any> = {
        type: "result",
        request,
        result: {
            success: false,
            triggers: [],
            errorMessage: "Unknown error",
        },
    };

    try {
        const id = request.blockKey + (request.args ? "--" + JSON.stringify(request.args) : "");

        console.time(id);
        const data = module.compute_block(
            msg.request.blockKey,
            msg.request.args ? JSON.stringify(msg.request.args) : ""
        );
        console.timeEnd(id);

        resultMsg.result.success = true;
        resultMsg.result.data = JSON.parse(data);
        resultMsg.result.errorMessage = undefined;
    } catch (ex) {
        // handle exceptions
        resultMsg.result.errorMessage = ex instanceof Error ? ex.message : ex + "";
        console.log("Error ahead ↓");
        console.error(ex);
    }

    self.postMessage(resultMsg);

    /*
    if (!database || !filters || !common) throw new Error("No data provided");

    // update active filters if provided
    if (msg.filters.channels) filters.updateChannels(msg.filters.channels);
    if (msg.filters.authors) filters.updateAuthors(msg.filters.authors);
    if (msg.filters.startDate) filters.updateStartDate(msg.filters.startDate);
    if (msg.filters.endDate) filters.updateEndDate(msg.filters.endDate);

    const request = msg.request;
    const resultMsg: BlockResultMessage<any> = {
        type: "result",
        request,
        result: {
            success: false,
            triggers: [],
            errorMessage: "Unknown error",
        },
    };

    try {
        if (!(request.blockKey in Blocks)) throw new Error("BlockFn not found");

        // set triggers
        resultMsg.result.triggers = Blocks[request.blockKey].triggers;

        const id = request.blockKey + (request.args ? "--" + JSON.stringify(request.args) : "");
        console.time(id);
        // @ts-expect-error (BlockArgs<any>)
        const data = Blocks[request.blockKey].fn(database, filters, common, request.args);
        console.timeEnd(id);

        resultMsg.result.success = true;
        resultMsg.result.data = data;
        resultMsg.result.errorMessage = undefined;
    } catch (ex) {
        // handle exceptions
        resultMsg.result.errorMessage = ex instanceof Error ? ex.message : ex + "";
        console.log("Error ahead ↓");
        console.error(ex);
    }

    self.postMessage(resultMsg);
    */
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
