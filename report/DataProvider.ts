import EventEmitter from "events";

import { BlockKey, BlocksDescMap, BlockState, Trigger } from "@pipeline/blocks/Blocks";
import { dateToString } from "@pipeline/Utils";
import { AuthorOption, Basic, ChannelOption } from "@report/Basic";

import Worker, { BlockRequestMessage, BlockResult, InitMessage, ReadyMessage } from "@report/WorkerReport";

export class DataProvider extends EventEmitter {
    private worker: Worker;
    private validRequestData: Set<Trigger> = new Set();
    private currentBlock?: BlockKey; // if currentBlock===undefined, the worker is available
    private currentBlockInvalidated: boolean = false;

    // Updated by the UI
    private activeBlocks: Set<BlockKey> = new Set();
    private activeIds: Set<number> = new Set();
    private activeChannels: ChannelOption[] = [];
    private activeAuthors: AuthorOption[] = [];
    private activeStartDate: Date = new Date();
    private activeEndDate: Date = new Date();

    // Updated by this class and the Worker
    public basic!: Basic;
    private blocksDescs?: BlocksDescMap;
    private readyBlocks: Map<BlockKey, any | null> = new Map();

    constructor(dataStr: string) {
        super();
        this.worker = Worker();
        this.worker.onerror = (e) => {
            console.log(e);
            alert("An error ocurred creating the WebWorker.\n\n Error: " + e.message);
            this.worker.terminate();
        };
        this.worker.onmessage = (e: MessageEvent<ReadyMessage | BlockResult>) => {
            const res = e.data;
            if (res.type === "ready") {
                this.emit("ready");
                this.basic = res.basic;
                this.blocksDescs = res.blocksDesc;
                // worker is ready, dispatch work
                console.log("Worker is ready");
                this.tryToDispatchWork();
            } else if (res.type === "result") {
                this.onWorkDone(res.blockKey, res.state, res.data);
            }
        };
        this.worker.postMessage(<InitMessage>{ type: "init", dataStr });
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

    updateChannels(channels: ChannelOption[]) {
        this.activeChannels = channels;
        this.invalidateBlocks("channels");
    }

    updateAuthors(authors: AuthorOption[]) {
        this.activeAuthors = authors;
        this.invalidateBlocks("authors");
    }

    updateTimeRange(start: Date, end: Date) {
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.warn("Invalid date");
            return;
        }
        this.activeStartDate = start;
        this.activeEndDate = end;
        this.invalidateBlocks("time");
    }

    tryToDispatchWork() {
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
            br.filters.channels = this.activeChannels.map((c) => c.id);
            this.validRequestData.add("channels");
        }
        if (!this.validRequestData.has("authors")) {
            br.filters.authors = this.activeAuthors.map((a) => a.id);
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
