import EventEmitter from "events";

import { BlockKey } from "@pipeline/aggregate/Blocks";

import { BlockResultMessage, BlockState, InitMessage, ReadyMessage } from "./WorkerReport";

type BlockKeyT = "a" | "b" | BlockKey;

export declare interface BlockStore {
    emit<K extends BlockKeyT>(event: `data-${K}`, data: any): boolean;
    on<K extends BlockKeyT>(event: `data-${K}`, listener: (data: any) => void): this;

    emit<K extends BlockKeyT>(event: `state-${K}`, state: BlockState): boolean;
    on<K extends BlockKeyT>(event: `state-${K}`, listener: (state: BlockState) => void): this;
}

export class BlockStore extends EventEmitter {
    private worker: Worker;

    private activeBlocks = new Map<BlockKeyT, number>();

    constructor(dataStr: string) {
        super();
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
                this.emit("state-a", "processing");
                await wait(648);
                this.emit("state-a", "ready");
                this.emit("data-a", { num: Math.random() });
                await wait(1338);
            }
        })();

        (async () => {
            let i = 5;
            while (1) {
                await wait(1000);
                this.emit("state-b", "processing");
                await wait(1000);
                this.emit("state-b", "ready");
                this.emit("data-b", { id: i++, num: Math.random() });
                await wait(1000);
            }
        })();
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

    enableBlock() {}

    getState(key: BlockKey): BlockState {
        return "waiting";
    }
}

let blockStore: BlockStore;

export const initBlockStore = (dataStr: string) => (blockStore = new BlockStore(dataStr));
export const getBlockStore = () => blockStore;
