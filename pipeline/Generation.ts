import { compress } from "compress-json";

import { FileInput, ReportConfig, StepInfo } from "@pipeline/Types";
import { downloadFile } from "@pipeline/Utils";
import { Parser } from "@pipeline/parse/Parser";
import { DiscordParser } from "@pipeline/parse/DiscordParser";
import { WhatsAppParser } from "@pipeline/parse/WhatsAppParser";
import { TelegramParser } from "@pipeline/parse/TelegramParser";
import { preprocess } from "./preprocess/Preprocess";

export async function* generateReport(files: FileInput[], config: ReportConfig): AsyncGenerator<StepInfo> {
    //
    // 1. Parse files
    //
    // Create parser
    let parser: Parser | null = null;
    switch (config.platform) {
        case "discord":
            parser = new DiscordParser();
            break;
        case "whatsapp":
            parser = new WhatsAppParser();
            break;
        case "telegram":
            parser = new TelegramParser();
            break;
        default:
            throw new Error(`Unknown platform: ${config.platform}`);
    }

    // Read files and parse
    for (let i = 0; i < files.length; i++) {
        yield { type: "new", title: "Parsing", subject: files[i].name };
        try {
            yield* parser.parse(files[i]);
        } catch (ex) {
            if (env.isDev) {
                throw ex;
            } else {
                throw new Error(`Error parsing file "${files[i].name}":\n${(ex as Error).message}`);
            }
        }
        yield { type: "done" };
    }

    const database = parser.database;
    parser = null;

    //
    // TEMPORAL
    // GENERATE RANDOM STUFF
    //
    for (let j = 0; j < 15; j++) {
        const total = Math.floor(Math.random() * 50);
        yield { type: "new", title: "thing " + j };
        for (let i = 0; i < total; i++) {
            yield { type: "progress", progress: [i + 1, total], format: "number" };
            await new Promise((resolve) => setTimeout(resolve, Math.random() * 5));
        }
        yield { type: "done" };
    }

    //
    // 2. Preprocess database
    //
    const preprocessed = yield* preprocess(database, config);

    //
    // 3. Compress data and export
    //
    const data_str = JSON.stringify(compress(preprocessed));

    let html = yield* downloadFile("report.html");
    html = html.replace("undefined", data_str);

    yield {
        type: "result",
        title: database.title,
        // @ts-ignore
        json: typeof env !== "undefined" && env.isDev ? data_str : undefined,
        html,
        time: Date.now(),
        counts: {
            authors: database.authors.size,
            channels: database.channels.size,
            messages: Object.values(database.messages).reduce((acc, val) => acc + val.length, 0),
        },
    };
}
