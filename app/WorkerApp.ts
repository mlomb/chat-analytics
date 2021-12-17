export default null as any;

import { ErrorStep, FileInput, Platform } from "@pipeline/Types";
import { generateReport } from "@pipeline/preprocess/Generation";

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
    // Sort files by lastModified
    // Very important so we always keep the most recent information (author, message, etc)
    const files = ev.data.files.sort((a, b) => (a.lastModified || 0) - (b.lastModified || 0));

    try {
        const gen = generateReport(files.map(wrapFile), { platform: ev.data.platform });
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
