import EventEmitter from "events";

import { Database, DateArr, ID } from "@pipeline/Types";
import { BlockDescriptions, BlockInfo, BlockKey, BlockTrigger } from "@pipeline/aggregate/Blocks";
import { dateToString, fromDateArr, maxDateArr, minDateArr, toDateArr } from "@pipeline/Util";

import Worker, { BlockRequestMessage, BlockResultMessage, InitMessage, ReadyMessage } from "@report/WorkerReport";

export declare interface DataProvider {
    emit<K extends BlockKey>(event: K, info: BlockInfo<K>): boolean;
    emit(event: "ready" | `trigger-${BlockTrigger}`): boolean;

    on<K extends BlockKey>(event: K, listener: (info: BlockInfo<K>) => void): this;
    on(event: "ready" | `trigger-${BlockTrigger}`, listener: () => void): this;
}

export class DataProvider extends EventEmitter {
    private worker: Worker;
    private validRequestData: Set<BlockTrigger> = new Set();
    private currentBlock?: BlockKey; // if currentBlock===undefined, the worker is available
    private currentBlockInvalidated: boolean = false;

    // active blocks
    // we track keys and ids because there can be multiple instances of the same block key (with different IDs)
    private activeBlocks: Set<BlockKey> = new Set();
    private activeBlockIds: Set<number> = new Set();

    // active filters
    private activeChannels: ID[] = [];
    private activeAuthors: ID[] = [];
    private channelsSet: boolean = false;
    private authorsSet: boolean = false;
    private activeStartDate: DateArr = [0, 0, 0];
    private activeEndDate: DateArr = [0, 0, 0];

    // Updated by this class and the Worker
    public database!: Database;
    private blocksDescs?: BlockDescriptions;
    private readyBlocks: Set<BlockKey> = new Set();

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

    private onMessage<K extends BlockKey>(e: MessageEvent<ReadyMessage | BlockResultMessage<K>>) {
        const res = e.data;
        if (res.type === "ready") {
            this.database = res.database;
            this.blocksDescs = res.blocksDescs;
            // set default time range
            this.activeStartDate = res.database.time.minDate;
            this.activeEndDate = res.database.time.maxDate;

            // worker is ready
            console.log("Worker is ready");
            this.emit("ready");
        } else if (res.type === "result") {
            this.onWorkDone(res.blockKey, res.blockInfo);
        }
    }

    toggleBlock(blockKey: BlockKey, id: number, active: boolean) {
        if (active) {
            this.activeBlockIds.add(id);
            this.activeBlocks.add(blockKey);

            // try to dispatch right away
            this.tryToDispatchWork();
        } else {
            if (this.activeBlockIds.has(id)) {
                this.activeBlocks.delete(blockKey);
                this.activeBlockIds.delete(id);
            }
        }
    }

    updateChannels(channels: ID[]) {
        this.activeChannels = channels;
        this.invalidateBlocks("channels");
        this.channelsSet = true;
    }

    updateAuthors(authors: ID[]) {
        this.activeAuthors = authors;
        this.invalidateBlocks("authors");
        this.authorsSet = true;
    }

    updateTimeRange(start: Date, end: Date) {
        const clampDate = (date: DateArr) =>
            maxDateArr(minDateArr(date, this.database.time.maxDate), this.database.time.minDate);

        this.activeStartDate = clampDate(toDateArr(start));
        this.activeEndDate = clampDate(toDateArr(end));
        this.invalidateBlocks("time");
    }

    private tryToDispatchWork() {
        if (this.blocksDescs === undefined) {
            // worker is not ready yet
            return;
        }
        if (!this.authorsSet || !this.channelsSet) {
            // we need to wait for the UI to set the filters
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
        this.emit(blockKey, {
            state: "loading",
            data: null,
        });

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

    private onWorkDone<K extends BlockKey>(blockKey: K, blockInfo: BlockInfo<K>) {
        console.assert(this.currentBlock === blockKey);

        // make sure the block we were working hasnt been invalidated
        if (this.currentBlockInvalidated) {
            // notify the UI
            this.emit(blockKey, {
                state: "stale",
                data: null,
            });
        } else {
            // store block result in case it is needed later
            // and notify the UI
            // TODO: store it
            this.readyBlocks.add(blockKey);
            this.emit(blockKey, blockInfo);
        }

        // make worker available again and try to dispatch more work
        this.currentBlock = undefined;
        this.currentBlockInvalidated = false;
        this.tryToDispatchWork();
    }

    private invalidateBlocks(trigger: BlockTrigger) {
        this.validRequestData.delete(trigger);
        this.emit(`trigger-${trigger}`);

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
                this.emit(blockKey, {
                    state: "stale",
                    data: null,
                });
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
        return fromDateArr(this.activeStartDate);
    }

    public getActiveEndDate(): Date {
        return fromDateArr(this.activeEndDate);
    }
}

let dataProvider: DataProvider;

export const initDataProvider = (dataStr: string) => (dataProvider = new DataProvider(dataStr));
export const useDataProvider = () => dataProvider;
