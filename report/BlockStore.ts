import EventEmitter from "events";

import { BlockResultMessage, InitMessage, ReadyMessage } from "./WorkerReport";

export declare interface BlockStore {
    emit<K extends BlockKey>(event: `data-${K}`, data: any): boolean;
    on<K extends BlockKey>(event: `data-${K}`, listener: (data: any) => void): this;

    emit<K extends BlockKey>(event: `state-${K}`, state: BlockState): boolean;
    on<K extends BlockKey>(event: `state-${K}`, listener: (state: BlockState) => void): this;
}

export class BlockStore extends EventEmitter {
    private worker: Worker;

    private activeBlocks = new Map<BlockKey, number>();

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
