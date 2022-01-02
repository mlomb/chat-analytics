export default null as any;

/*
import { BlockRequestMessage, BlockResultMessage, InitMessage, ReadyMessage } from "@pipeline/Messages";
import { BlocksDesc, BlocksProcessFn } from "@pipeline/blocks/Blocks";
import { ReportData } from "@pipeline/process/ReportData";
import { DataDeserializer } from "@pipeline/shared/SerializedData";
import { Filters } from "@pipeline/blocks/Filters";
*/
import { Database } from "@pipeline/Types";

import { decompress } from "@pipeline/report/Compression";

/*
let reportData: ReportData | null = null;
let dataDeserializer: DataDeserializer | null = null;
let filters: Filters | null = null;
*/

/*
const init = async (msg: InitMessage) => {
    const [_reportData, serializedData] = await decompress(msg.dataStr);
    reportData = _reportData;
    dataDeserializer = new DataDeserializer(serializedData);
    filters = new Filters(reportData.authors.length);

    self.postMessage(<ReadyMessage>{
        type: "ready",
        reportData,
        blocksDesc: BlocksDesc,
    });

    if (env.isDev) {
        console.log(reportData, serializedData);
    }
};

const request = async (msg: BlockRequestMessage) => {
    if (!filters || !reportData || !dataDeserializer) throw new Error("No data provided");

    const br = msg;
    // update active data if provided
    if (br.filters.channels) filters.updateChannels(br.filters.channels);
    if (br.filters.authors) filters.updateAuthors(br.filters.authors);
    if (br.filters.startDate) filters.updateStartDate(br.filters.startDate);
    if (br.filters.endDate) filters.updateEndDate(br.filters.endDate);

    try {
        if (!(br.blockKey in BlocksProcessFn)) throw new Error("BlockFn not found");

        console.time(br.blockKey);
        const data = BlocksProcessFn[br.blockKey](reportData, dataDeserializer, filters);
        console.timeEnd(br.blockKey);

        self.postMessage(<BlockResultMessage>{
            type: "result",
            blockKey: br.blockKey,
            state: "ready",
            data,
        });
    } catch (err) {
        console.error(err);
        self.postMessage(<BlockResultMessage>{
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
            request(ev.data);
            break;
    }
};

*/

export interface InitMessage {
    type: "init";
    dataStr: string;
}

export interface ReadyMessage {
    type: "ready";
    database: Database;
}

const init = (msg: InitMessage) => {
    const database = decompress(msg.dataStr);

    self.postMessage(<ReadyMessage>{
        type: "ready",
        database: {
            ...database,
            // no needed in the UI
            serialized: undefined,
        },
    });

    if (env.isDev) console.log(database);
};

self.onmessage = (ev: MessageEvent<InitMessage>) => {
    switch (ev.data.type) {
        case "init":
            init(ev.data);
            break;
    }
};

console.log("WorkerReport started");
