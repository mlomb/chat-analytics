import { BlockData, BlockKey } from "@pipeline/aggregate/Blocks";

import { BlockRequest, BlockResult, BlockResultMessage, InitMessage, ReadyMessage } from "./WorkerReport";

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

export const idRequest = (request: BlockRequest<BlockKey>): BlockRequestID => {
    // TODO: fix JSON stringify may not produce the same string for identical objects
    return request.blockKey + "--" + JSON.stringify(request.args);
};

/**
 * Block storage and management
 *
 * SUBSCRIBE TO BLOCK - hook
 * ENABLE BLOCK - loading group
 */
export class BlockStore {
    private worker: Worker;

    /** Subscribers of blocks */
    private blockListeners = new Map<BlockRequestID, Set<BlockListener<BlockKey>>>();
    /** Block results that are still valid (to reuse) */
    private validBlocks = new Map<BlockRequestID, BlockStatus<BlockKey>>();
    /** Currently enabled blocks (that means in view and should be processed) */
    private activeBlocks: BlockRequest<BlockKey>[] = [];

    constructor(dataStr: string) {
        // @ts-ignore
        this.worker = new Worker(new URL("@report/WorkerReport.ts", import.meta.url));
        this.worker.onerror = this.onError.bind(this);
        this.worker.onmessage = this.onMessage.bind(this);
        this.worker.postMessage({ type: "init", dataStr } as InitMessage);

        this.test();
    }

    test() {
        const wait = async (ms: number) => {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        };

        (async () => {
            while (1) {
                await wait(599);
                //this.emit("state-a", "processing");
                await wait(648);
                //this.emit("state-a", "ready");
                //this.emit("data-a", { num: Math.random() });
                await wait(1338);
            }
        })();

        (async () => {
            let i = 5;
            while (1) {
                await wait(1000);
                //this.emit("state-b", "processing");
                await wait(1000);
                //this.emit("state-b", "ready");
                //this.emit("data-b", { id: i++, num: Math.random() });
                await wait(1000);
            }
        })();

        this.testKey("a");
        this.testKey("b");
        this.testKey("c");
        this.testKey("d");
    }

    private onError(e: ErrorEvent) {
        console.log(e);
        alert("An error occurred creating the WebWorker.\n\n Error: " + e.message);
        this.worker.terminate();
    }

    // @ts-ignore
    private onMessage(e: MessageEvent<ReadyMessage | BlockResultMessage<BlockKey>>) {
        //-
    }

    testKey(k: string) {
        const request = { blockKey: k, args: undefined };
        const wait = async (ms: number) => {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        };
        (async () => {
            while (1) {
                await wait(1000 * Math.random() + 500);
                // @ts-expect-error
                this.update(request, { state: "processing" });
                await wait(1000 * Math.random() + 500);
                // @ts-expect-error
                this.update(request, { state: "ready", data: { num: Math.random() } });
            }
        })();
    }

    getStoredStatus<K extends BlockKey>(request: BlockRequest<K>): BlockStatus<K> {
        const id = idRequest(request);
        const status = this.validBlocks.get(id);
        if (status) return status;
        return { state: "waiting" };
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
        this.activeBlocks.push(request);
    }

    disable<K extends BlockKey>(request: BlockRequest<K>) {
        const id = idRequest(request);
        const index = this.activeBlocks.findIndex((r) => id === idRequest(r));
        if (index >= 0) this.activeBlocks.splice(index, 1);
    }

    private update(request: BlockRequest<BlockKey>, status: BlockStatus<BlockKey>) {
        const id = idRequest(request);
        this.validBlocks.set(id, status);
        const listeners = this.blockListeners.get(id);
        if (listeners) {
            for (const listener of listeners) {
                listener(status);
            }
        }
    }
}

let blockStore: BlockStore;

export const initBlockStore = (dataStr: string) => (blockStore = new BlockStore(dataStr));
export const getBlockStore = () => blockStore;
