import EventEmitter from "events";

import { Platform } from "@pipeline/Types";
import { Author, Channel, ProcessedData } from "@pipeline/preprocess/ProcessedData";
import { BlockKey, BlockState } from "@pipeline/blocks/Blocks";

import Worker, { BlockResult } from "@report/WorkerReport";

type QueueEntry = {
    blockKey: BlockKey;
    timestamp: number;
};

export class DataProvider extends EventEmitter {
    private worker: Worker;
    private currentBlock?: BlockKey; // if currentBlock===undefined, the worker is available
    private currentBlockInvalidated: boolean = false;

    // Updated by the UI
    private activeBlocks: Set<BlockKey> = new Set();
    private activeIds: Set<number> = new Set();
    private activeChannels: Channel[] = [];
    private activeAuthors: Author[] = [];
    private activeStartDate: Date = new Date();
    private activeEndDate: Date = new Date();

    // Updated by this class and the Worker
    private readyBlocks: Map<BlockKey, any | null> = new Map();

    constructor(public readonly source: ProcessedData) {
        super();
        this.worker = Worker();
        this.worker.onmessage = (e: MessageEvent<BlockResult>) => {
            const res = e.data;
            this.onWorkDone(res.blockKey, res.state, res.data);
        };
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
        console.log(this.activeBlocks, this.activeIds);
    }

    updateChannels(channels: Channel[]) {
        this.activeChannels = channels;
        this.invalidateBlocks([]);
    }

    updateAuthors(authors: Author[]) {
        this.activeAuthors = authors;
        this.invalidateBlocks([]);
    }

    updateTimeRange(start: Date, end: Date) {
        this.activeStartDate = start;
        this.activeEndDate = end;
        //this.emit("updated-zoom");
        this.invalidateBlocks([]);
    }

    tryToDispatchWork() {
        // pick an active block that is not ready
        const pendingBlocks = [...this.activeBlocks].filter((k) => !this.readyBlocks.has(k));

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

        // TODO: replace with real work
        this.worker.postMessage({
            blockKey,
        });
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

    private invalidateBlocks(exception: BlockKey[]) {
        // invalidate all ready blocks with exceptions
        for (const blockKey of this.readyBlocks.keys()) {
            if (!exception.includes(blockKey)) {
                // must invalidate
                // remove from ready blocks and notify UI of stale data
                this.readyBlocks.delete(blockKey);
                this.emit(blockKey, "stale", undefined);
            }
        }
        // if we are currently working on a block, mark to invalidate
        if (this.currentBlock !== undefined && !exception.includes(this.currentBlock)) {
            this.currentBlockInvalidated = true;
        }

        // recompute
        this.tryToDispatchWork();
    }
}

export declare var platform: Platform;
export declare var dataProvider: DataProvider;

export const initDataProvider = (source: ProcessedData) => {
    dataProvider = new DataProvider(source);
    platform = source.platform;
};
