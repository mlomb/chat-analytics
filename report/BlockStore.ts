import { BlockData, BlockKey, Filter } from "@pipeline/aggregate/Blocks";
import { BlockRequest, BlockRequestMessage, BlockResult } from "@report/WorkerReport";
import { WorkerWrapper, getWorker } from "@report/WorkerWrapper";

/**
 * State of a block request
 *
 * - `waiting`: waiting for the worker to become available
 * - `processing`: the worker is currently processing this block
 * - `ready`: the block has been computed correctly and its data is available
 * - `error` there was an error computing this block
 */
export type BlockState = "waiting" | "processing" | "ready" | "error";

export type BlockStatus<K extends BlockKey> = {
    state: BlockState;
    error?: string;
    data?: BlockData<K>;
};

export type BlockListener<K extends BlockKey> = (status: BlockStatus<K>) => void;

/** Identifies a block request (the block key and its arguments) */
export type BlockRequestID = string;

/** Generates a unique identifier for a block request */
export const idRequest = (request: BlockRequest<BlockKey> | undefined): BlockRequestID => {
    if (request === undefined) return "undefined";

    // TODO: fix JSON stringify may not produce the same string for identical objects
    // for now we don't have arguments with more than one key so it's fine
    return request.blockKey + "--" + JSON.stringify(request.args);
};

/**
 * Block storage and management.
 * It tracks computed blocks and dispatches work to the worker.
 *
 * The way it works is a two step process:
 * 1. You have to subscribe (with `subscribe`) to a block to get notified of status changes
 * 2. You have to enable (with `enable`) a block to make it be computed
 */
export class BlockStore {
    /** Subscribers of blocks */
    private blockListeners = new Map<BlockRequestID, Set<BlockListener<BlockKey>>>();

    /** Currently enabled requests (that means in view and should be processed eventually) */
    private enabledBlocks: BlockRequest<BlockKey>[] = [];

    /** Requests computed and up to date (not invalidated) */
    private storedBlocks = new Map<BlockRequestID, BlockStatus<BlockKey>>();
    /** Requests last broadcasted state (valid and invalidated) */
    private lastBroadcastedState = new Map<BlockRequestID, BlockState>();

    /** Which requests must be marked as stale after a filter changes */
    private filterDependencies: { [filter in Filter]: Set<BlockRequestID> } = {
        authors: new Set(),
        channels: new Set(),
        time: new Set(),
    };

    constructor(private readonly worker: WorkerWrapper) {
        worker.on("ready", this.tryToDispatchWork.bind(this));
        worker.on("filter-change", this.onFilterChange.bind(this));
        worker.on("result", this.onWorkDone.bind(this));
    }

    private onFilterChange(trigger: Filter) {
        // mark all blocks that depend on this trigger as stale
        for (const reqId of this.filterDependencies[trigger]) {
            this.storedBlocks.delete(reqId);
            this.update(reqId, { state: "waiting" });
        }

        // recompute
        this.tryToDispatchWork();
    }

    private onWorkDone<K extends BlockKey>(request: BlockRequest<K>, result: BlockResult<K>, invalid: boolean) {
        if (invalid) {
            // the block was invalidated while being computed
            this.update(idRequest(request), { state: "waiting" });
        } else {
            // the block is valid
            this.update(idRequest(request), {
                state: result.success ? "ready" : "error",
                data: result.data,
                error: result.errorMessage,
            });

            for (const trigger of result.triggers) {
                this.filterDependencies[trigger].add(idRequest(request));
            }
        }

        // try to dispatch more work
        this.tryToDispatchWork();
    }

    subscribe<K extends BlockKey>(request: BlockRequest<K>, listener: BlockListener<K>) {
        const id = idRequest(request);
        let listeners = this.blockListeners.get(id);
        if (!listeners) {
            listeners = new Set();
            this.blockListeners.set(id, listeners);
        }
        listeners.add(listener);
    }

    unsubscribe<K extends BlockKey>(request: BlockRequest<K>, listener: BlockListener<K>) {
        const listeners = this.blockListeners.get(idRequest(request));
        listeners?.delete(listener);
    }

    enable<K extends BlockKey>(request: BlockRequest<K>) {
        this.enabledBlocks.push(request);
        this.tryToDispatchWork();
    }

    disable<K extends BlockKey>(request: BlockRequest<K>) {
        const id = idRequest(request);
        // remove first occurrence by id
        const index = this.enabledBlocks.findIndex((r) => id === idRequest(r));
        if (index >= 0) this.enabledBlocks.splice(index, 1);
    }

    private tryToDispatchWork() {
        if (this.worker.areFiltersSet === false) {
            // we need to wait for the UI to set the filters
            return;
        }

        // pick an active block that is not ready
        const pendingRequests = this.enabledBlocks
            .map(idRequest)
            .filter((id) => !this.storedBlocks.has(id) || this.storedBlocks.get(id)?.state === "waiting");

        // if there is pending work and the worker is available
        if (pendingRequests.length > 0 && this.worker.available) {
            const id = pendingRequests[0];
            const request = this.enabledBlocks.find((r) => id === idRequest(r))!;

            // work goes brrr
            this.dispatchWork(request);
        }
    }

    private dispatchWork(request: BlockRequest<BlockKey>) {
        // notify that this block is loading
        this.update(idRequest(request), { state: "processing" });

        // dispatch work
        this.worker.sendBlockRequest(request);
    }

    private update(id: BlockRequestID, status: BlockStatus<BlockKey>) {
        // check if the status changed (and its not ready since data may change)
        if (status.state !== "ready" && this.lastBroadcastedState.get(id) === status.state) return;

        // store block result in case it is needed later
        this.storedBlocks.set(id, status);
        this.lastBroadcastedState.set(id, status.state);

        // and notify the UI
        const listeners = this.blockListeners.get(id);
        listeners?.forEach((listener) => listener(status));
    }

    getStoredStatus<K extends BlockKey>(request: BlockRequest<K>): BlockStatus<K> {
        const status = this.storedBlocks.get(idRequest(request));
        if (status) return status;
        return { state: "waiting" };
    }
}

let blockStore: BlockStore;

export const initBlockStore = () => (blockStore = new BlockStore(getWorker()));
export const getBlockStore = () => blockStore;
