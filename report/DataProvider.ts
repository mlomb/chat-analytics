import EventEmitter from "events";

import { ID } from "@pipeline/Types";
import { BlockRequestMessage, BlockResultMessage, InitMessage, ReadyMessage } from "@pipeline/Messages";
import { BlockKey, BlocksDescMap, BlockState, Trigger } from "@pipeline/blocks/Blocks";
import { dateToString } from "@pipeline/Utils";
import { Basic } from "@report/Basic";

import Worker from "@report/WorkerReport";

export class DataProvider extends EventEmitter {
    private worker: Worker;
    private validRequestData: Set<Trigger> = new Set();
    private currentBlock?: BlockKey; // if currentBlock===undefined, the worker is available
    private currentBlockInvalidated: boolean = false;

    // Updated by the UI
    private activeBlocks: Set<BlockKey> = new Set();
    private activeIds: Set<number> = new Set();
    private activeChannels: ID[] = [];
    private activeAuthors: ID[] = [];
    private activeStartDate: Date = new Date();
    private activeEndDate: Date = new Date();

    // Updated by this class and the Worker
    public basic!: Basic;
    private blocksDescs?: BlocksDescMap;
    private readyBlocks: Map<BlockKey, any | null> = new Map();

    constructor(dataStr: string) {
        super();
        this.worker = Worker();
        this.worker.onerror = this.onError.bind(this);
        this.worker.onmessage = this.onMessage.bind(this);
        this.worker.postMessage(<InitMessage>{ type: "init", dataStr });
    }

    private onError(e: ErrorEvent) {
        console.log(e);
        alert("An error ocurred creating the WebWorker.\n\n Error: " + e.message);
        this.worker.terminate();
    }

    private onMessage(e: MessageEvent<ReadyMessage | BlockResultMessage>) {
        const res = e.data;
        if (res.type === "ready") {
            this.basic = res.basic;
            this.blocksDescs = res.blocksDesc;
            // set default time range
            this.activeStartDate = new Date(res.basic.minDate);
            this.activeEndDate = new Date(res.basic.maxDate);

            console.log("Worker is ready");

            // worker is ready, dispatch work
            this.emit("ready");
            this.tryToDispatchWork();
        } else if (res.type === "result") {
            this.onWorkDone(res.blockKey, res.state, res.data);
        }
    }

    toggleBlock(blockKey: BlockKey, id: number, active: boolean) {
        if (active) {
            this.activeIds.add(id);
            this.activeBlocks.add(blockKey);

            // try to dispatch right away
            this.tryToDispatchWork();
        } else {
            if (this.activeIds.has(id)) {
                this.activeBlocks.delete(blockKey);
                this.activeIds.delete(id);
            }
        }
        // console.log(this.activeBlocks, this.activeIds);
    }

    updateChannels(channels: ID[]) {
        this.activeChannels = channels;
        this.invalidateBlocks("channels");
    }

    updateAuthors(authors: ID[]) {
        this.activeAuthors = authors;
        this.invalidateBlocks("authors");
    }

    updateTimeRange(start: Date, end: Date) {
        this.activeStartDate = start;
        this.activeEndDate = end;
        this.invalidateBlocks("time");
    }

    private tryToDispatchWork() {
        if (this.blocksDescs === undefined) {
            // worker is not ready yet
            return;
        }

        // pick an active block that is not ready
        const pendingBlocks = Array.from(this.activeBlocks).filter((k) => !this.readyBlocks.has(k));

        // if there is pending work and the worker is available
        if (pendingBlocks.length > 0 && this.currentBlock === undefined) {
            // work goes brrr
            this.dispatchWork(pendingBlocks[0]);
        }
    }

    private dispatchWork(blockKey: BlockKey) {
        // make worker unavailable
        this.currentBlock = blockKey;
        this.currentBlockInvalidated = false;

        // notify that this block is loading
        this.emit(blockKey, "loading", undefined);

        // dispatch work
        const br: BlockRequestMessage = {
            type: "request",
            blockKey,
            filters: {},
        };
        if (!this.validRequestData.has("channels")) {
            br.filters.channels = this.activeChannels;
            this.validRequestData.add("channels");
        }
        if (!this.validRequestData.has("authors")) {
            br.filters.authors = this.activeAuthors;
            this.validRequestData.add("authors");
        }
        if (!this.validRequestData.has("time")) {
            br.filters.startDate = dateToString(this.activeStartDate);
            br.filters.endDate = dateToString(this.activeEndDate);
            this.validRequestData.add("time");
        }
        this.worker.postMessage(br);
    }

    private onWorkDone(blockKey: BlockKey, state: BlockState, data: any | null) {
        console.assert(this.currentBlock === blockKey);

        // make sure the block we were working hasnt been invalidated
        if (this.currentBlockInvalidated) {
            // notify the UI
            this.emit(blockKey, "stale", undefined);
        } else {
            // store block result in case it is needed later
            // and notify the UI
            this.readyBlocks.set(blockKey, data);
            this.emit(blockKey, state, data);
        }

        // make worker available again and try to dispatch more work
        this.currentBlock = undefined;
        this.currentBlockInvalidated = false;
        this.tryToDispatchWork();
    }

    private invalidateBlocks(trigger: Trigger) {
        this.validRequestData.delete(trigger);
        this.emit("trigger-" + trigger);

        if (this.blocksDescs === undefined) {
            // worker is not ready yet
            return;
        }

        // invalidate all ready blocks with exceptions
        for (const blockKey of this.readyBlocks.keys()) {
            if (!(blockKey in this.blocksDescs) || this.blocksDescs[blockKey].triggers.includes(trigger)) {
                // must invalidate
                // remove from ready blocks and notify UI of stale data
                this.readyBlocks.delete(blockKey);
                this.emit(blockKey, "stale", undefined);
            }
        }
        // if we are currently working on a block, mark to invalidate
        if (
            this.currentBlock !== undefined &&
            (!(this.currentBlock in this.blocksDescs) || this.blocksDescs[this.currentBlock].triggers.includes(trigger))
        ) {
            this.currentBlockInvalidated = true;
        }

        // recompute
        this.tryToDispatchWork();
    }

    public getActiveStartDate(): Date {
        return this.activeStartDate;
    }

    public getActiveEndDate(): Date {
        return this.activeEndDate;
    }
}

let dataProvider: DataProvider;

export const initDataProvider = (dataStr: string) => (dataProvider = new DataProvider(dataStr));
export const useDataProvider = () => dataProvider;
