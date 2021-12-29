export default null as any;

import { ReportConfig } from "@pipeline/Types";
import { generateDatabase, generateReportSite } from "@pipeline/report/Generate";
import { progress } from "@pipeline/Progress";
import { FileInput } from "@pipeline/File";

export interface InitMessage {
    files: File[];
    config: ReportConfig;
}

export interface ResultMessage {
    type: "result";
    data?: string;
    html: string;
    title: string;
    counts: {
        authors: number;
        channels: number;
        messages: number;
    };
}

const wrapFile = (file: File): FileInput => ({
    name: file.name,
    size: file.size,
    slice: (start, end) => (start !== undefined ? file.slice(start, end).arrayBuffer() : file.arrayBuffer()),
});

self.onmessage = async (ev: MessageEvent<InitMessage>) => {
    // Sort files by lastModified
    // ***Very important*** so we always keep the most recent information last (since we overwrite it)
    const files = ev.data.files.sort((a, b) => (a.lastModified || 0) - (b.lastModified || 0));

    progress.reset();
    progress.on("update", (msg) => self.postMessage(msg));

    try {
        const database = await generateDatabase(files.map(wrapFile), ev.data.config);
        const result = await generateReportSite(database);
        self.postMessage(<ResultMessage>{
            type: "result",
            data: env.isDev ? result.data : "",
            html: result.html,
            title: database.title,
            counts: {
                authors: database.authors.length,
                channels: database.channels.length,
                messages: Object.values(database.channels).reduce((acc, val) => acc + val.msgCount, 0),
            },
        });
    } catch (ex) {
        // handle exceptions
        if (ex instanceof Error) {
            progress.error(ex.message);
        } else {
            progress.error(ex + "");
        }
        console.log("Error ahead ↓");
        console.error(ex);
    }
};

console.log("WorkerApp started");
