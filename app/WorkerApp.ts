import { ReportConfig } from "@pipeline/Types";
import { FileInput } from "@pipeline/File";
import { progress } from "@pipeline/Progress";
import { generateDatabase, generateReportSite } from "@pipeline/process/Generate";

export interface InitMessage {
    files: File[];
    config: ReportConfig;
    origin: string;
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
    lastModified: file.lastModified,
    slice: (start, end) => (start !== undefined ? file.slice(start, end).arrayBuffer() : file.arrayBuffer()),
});

self.onmessage = async (ev: MessageEvent<InitMessage>) => {
    progress.reset();
    progress.on("update", (msg) => self.postMessage(msg));

    try {
        const database = await generateDatabase(ev.data.files.map(wrapFile), ev.data.config);
        if (env.isDev) console.log(database);
        const result = await generateReportSite(database);
        if (env.isDev) {
            // include the origin in relative URLs, so it can be opened locally
            result.html = result.html
                .replace('<script defer src="', '<script defer src="' + ev.data.origin)
                .replace('<link href="', '<link href="' + ev.data.origin);
        }
        self.postMessage(<ResultMessage>{
            type: "result",
            data: env.isDev ? result.data : "",
            html: result.html,
            title: "TODO: title",
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
