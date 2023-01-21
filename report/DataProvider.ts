import EventEmitter from "events";

import { Day } from "@pipeline/Time";
import { Database, FormatCache, Index } from "@pipeline/Types";
import { BlockDescriptions, BlockInfo, BlockKey, BlockTrigger } from "@pipeline/aggregate/Blocks";
import { BlockRequestMessage, BlockResultMessage, InitMessage, ReadyMessage } from "@report/WorkerReport";

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
    private activeBlocks: Set<`${BlockKey}|${number}`> = new Set();

    // active filters
    private activeChannels: Index[] = [];
    private activeAuthors: Index[] = [];
    private channelsSet: boolean = false;
    private authorsSet: boolean = false;
    private activeStartDate: Day | undefined;
    private activeEndDate: Day | undefined;

    // Updated by this class and the Worker
    public database!: Database;
    public formatCache!: FormatCache;
    private blocksDescs?: BlockDescriptions;
    private readyBlocks: Map<BlockKey, BlockInfo<any>> = new Map();

    constructor(dataStr: string) {
        super();
        if (env.isDev) {
            if (document.location.protocol === "blob:") {
                // this is when we are in a blob, in that case building the URL with import.meta.url will fail
                // so we use the following workaround to use the correct origin
                this.worker = new Worker(
                    new URL(__webpack_require__.u("report_WorkerReport_ts"), document.location.origin)
                );
            } else {
                // normal webpack v5 worker loading
                // @ts-ignore
                this.worker = new Worker(new URL("@report/WorkerReport.ts", import.meta.url));
            }
        } else {
            // Why we use base64 instead of Blob+URL.createObjectURL?
            // Chrome Mobile crashes if you use createObjectURL from an .html file :)
            // See: https://bugs.chromium.org/p/chromium/issues/detail?id=1150828&q=createObjectURL%20crash
            // We can work around it using base64, so no requests are made
            // NOTE: data:application/javascript breaks
            const workerJs = document.getElementById("worker-script")!.textContent!;
            this.worker = new Worker(
                "data:application/javascript;base64," + btoa(unescape(encodeURIComponent(workerJs)))
            );
        }
        this.worker.onerror = this.onError.bind(this);
        this.worker.onmessage = this.onMessage.bind(this);
        this.worker.postMessage({ type: "init", dataStr } as InitMessage);
    }

    private onError(e: ErrorEvent) {
        console.log(e);
        alert("An error occurred creating the WebWorker.\n\n Error: " + e.message);
        this.worker.terminate();
    }

    private onMessage<K extends BlockKey>(e: MessageEvent<ReadyMessage | BlockResultMessage<K>>) {
        const res = e.data;
        if (res.type === "ready") {
            this.database = res.database;
            this.formatCache = res.formatCache;

            this.blocksDescs = res.blocksDescs;
            // set default time range
            this.activeStartDate = Day.fromKey(res.database.time.minDate);
            this.activeEndDate = Day.fromKey(res.database.time.maxDate);

            // worker is ready
            console.log("Worker is ready");
            this.emit("ready");
        } else if (res.type === "result") {
            this.onWorkDone(res.blockKey, res.blockInfo);
        }
    }

    toggleBlock(blockKey: BlockKey, id: number, active: boolean) {
        const key: `${BlockKey}|${number}` = `${blockKey}|${id}`;

        if (active) {
            this.activeBlocks.add(key);

            // try to dispatch right away
            this.tryToDispatchWork();
        } else {
            this.activeBlocks.delete(key);
        }
    }

    updateChannels(channels: Index[]) {
        this.activeChannels = channels;
        this.invalidateBlocks("channels");
        this.channelsSet = true;
    }

    updateAuthors(authors: Index[]) {
        this.activeAuthors = authors;
        this.invalidateBlocks("authors");
        this.authorsSet = true;
    }

    updateTimeRange(start: Date, end: Date) {
        const clampDate = (day: Day) =>
            Day.clamp(day, Day.fromKey(this.database.time.minDate), Day.fromKey(this.database.time.maxDate));
        this.activeStartDate = clampDate(Day.fromDate(start));
        this.activeEndDate = clampDate(Day.fromDate(end));
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
        const pendingBlocks = Array.from(this.activeBlocks).filter(
            (k) => !this.readyBlocks.has(k.split("|")[0] as BlockKey)
        );

        // if there is pending work and the worker is available
        if (pendingBlocks.length > 0 && this.currentBlock === undefined) {
            // work goes brrr
            this.dispatchWork(pendingBlocks[0].split("|")[0] as BlockKey);
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
            br.filters.startDate = this.activeStartDate?.dateKey;
            br.filters.endDate = this.activeEndDate?.dateKey;
            this.validRequestData.add("time");
        }
        this.worker.postMessage(br);
    }

    private onWorkDone<K extends BlockKey>(blockKey: K, blockInfo: BlockInfo<K>) {
        console.assert(this.currentBlock === blockKey);

        // make sure the block we were working hasn't been invalidated
        if (this.currentBlockInvalidated) {
            // notify the UI
            this.emit(blockKey, {
                state: "stale",
                data: null,
            });
        } else {
            // store block result in case it is needed later
            // and notify the UI
            this.readyBlocks.set(blockKey, blockInfo);
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
        return this.activeStartDate!.toDate();
    }

    public getActiveEndDate(): Date {
        // we add one day because zoomToDates is [start, end)
        return this.activeEndDate!.nextDay().toDate();
    }

    public getBlockInfo<K extends BlockKey>(blockKey: K): BlockInfo<K> {
        if (this.readyBlocks.has(blockKey)) {
            return this.readyBlocks.get(blockKey)!;
        } else {
            return {
                state: "stale",
                data: null,
            };
        }
    }
}

let dataProvider: DataProvider;

export const initDataProvider = (dataStr: string) => (dataProvider = new DataProvider(dataStr));
export const useDataProvider = () => dataProvider;
