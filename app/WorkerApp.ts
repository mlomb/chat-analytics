export default null as any;

import { Platform } from "@pipeline/Types";
import { generateReport } from "@pipeline/Generation";

export interface InitMessage {
    platform: Platform;
    files: File[];
}

self.onmessage = async (ev: MessageEvent<InitMessage>) => {
    try {
        const gen = generateReport(ev.data.files, {
            platform: ev.data.platform,
        });
        for await (const packet of gen) {
            self.postMessage(packet);
        }
    } catch (ex) {
        // handle exceptions
        if (ex instanceof Error) {
            self.postMessage({ type: "error", error: ex.message });
        } else {
            self.postMessage({ type: "error", error: ex + "" });
        }
        console.log("Error ahead ↓");
        console.error(ex);
    }
};

console.log("WorkerApp started");
