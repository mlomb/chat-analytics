import { WebEnv, wrapFile } from "@app/WebEnv";
import { ProgressStats, ProgressTask } from "@pipeline/Progress";
import { ReportConfig } from "@pipeline/Types";
import { generateDatabase, generateReport } from "@pipeline/process/Generate";

/** Message sent by the UI to start the generation process */
export interface InitMessage {
    files: File[];
    config: ReportConfig;
    origin: string;
}

/** Message sent by the worker to the UI periodically to update progress information */
export interface ProgressMessage {
    type: "progress";
    tasks: ProgressTask[];
    stats: ProgressStats;
}

/** Message sent by the worker with the report ready and stats */
export interface ResultMessage {
    type: "result";
    data?: string;
    html: string;
    title: string;
    counts: {
        messages: number;
        authors: number;
        channels: number;
        guilds: number;
    };
}

self.onmessage = async (ev: MessageEvent<InitMessage>) => {
    const { progress } = WebEnv;

    progress.reset();
    progress.on("progress", (tasks, stats) =>
        self.postMessage({
            type: "progress",
            tasks,
            stats,
        })
    );

    try {
        const database = await generateDatabase(ev.data.files.map(wrapFile), ev.data.config, WebEnv);
        if (env.isDev) console.log(database);
        const result = await generateReport(database, WebEnv);
        if (env.isDev) {
            // include the origin in relative URLs, so it can be opened locally
            // e.g. http://localhost:8080
            result.html = result.html
                .replace('<script defer src="', '<script defer src="' + ev.data.origin)
                .replace('<link href="', '<link href="' + ev.data.origin);
        }

        const message: ResultMessage = {
            type: "result",
            data: env.isDev ? result.data : "",
            html: result.html,
            title: database.title,
            counts: {
                messages: Object.values(database.channels).reduce((acc, ch) => acc + (ch.msgCount ?? 0), 0),
                authors: database.authors.length,
                channels: database.channels.length,
                guilds: database.guilds.length,
            },
        };

        self.postMessage(message);
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
