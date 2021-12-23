export default null as any;

import { BlockRequestMessage, BlockResultMessage, InitMessage, ReadyMessage } from "@pipeline/Messages";
import { BlocksDesc, BlocksProcessFn, BlockState, Filters } from "@pipeline/blocks/Blocks";
import { ReportData } from "@pipeline/process/ReportData";
import { DataDeserializer } from "@pipeline/shared/SerializedData";
import { decompress } from "@pipeline/shared/Compression";
import { computeBasic } from "@report/Basic";

let reportData: ReportData | null = null;
let dataDeserializer: DataDeserializer | null = null;
let fitlers: Filters = {
    channels: [],
    channelsSet: new Set(),
    authors: [],
    authorsSet: new Set(),
    startDate: "",
    endDate: "",
};

const init = async (msg: InitMessage) => {
    const [_reportData, serializedData] = await decompress(msg.dataStr);
    reportData = _reportData;
    dataDeserializer = new DataDeserializer(serializedData);

    self.postMessage(<ReadyMessage>{
        type: "ready",
        basic: computeBasic(reportData),
        blocksDesc: BlocksDesc,
    });

    if (env.isDev) {
        console.log(reportData, serializedData);
    }
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
        if (!reportData || !dataDeserializer) throw new Error("No data provided");
        if (!(br.blockKey in BlocksProcessFn)) throw new Error("BlockFn not found");

        const data = BlocksProcessFn[br.blockKey](reportData, dataDeserializer, fitlers);

        self.postMessage(<BlockResultMessage>{
            type: "result",
            blockKey: br.blockKey,
            state: "ready",
            data,
        });
    } catch (err) {
        // console.error(err);
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

console.log("WorkerReport started");
