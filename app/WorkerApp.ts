export default null as any;

import { ErrorStep, FileInput, Platform } from "@pipeline/Types";
import { generateReport } from "@pipeline/Generation";

export interface InitMessage {
    platform: Platform;
    files: File[];
}

const wrapFile = (file: File): FileInput => ({
    name: file.name,
    size: file.size,
    slice: (start, end) => (start !== undefined ? file.slice(start, end).arrayBuffer() : file.arrayBuffer()),
});

self.onmessage = async (ev: MessageEvent<InitMessage>) => {
    try {
        const gen = generateReport(ev.data.files.map(wrapFile), { platform: ev.data.platform });
        for await (const packet of gen) {
            self.postMessage(packet);
        }
    } catch (ex) {
        // handle exceptions
        if (ex instanceof Error) {
            self.postMessage(<ErrorStep>{ type: "error", error: ex.message });
        } else {
            self.postMessage(<ErrorStep>{ type: "error", error: ex + "" });
        }
        console.log("Error ahead ↓");
        console.error(ex);
    }
};

console.log("WorkerApp started");
