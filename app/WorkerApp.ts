export default null as any;

import { Platform, StepInfo } from "@pipeline/Types";
import { Parser } from "@pipeline/parse/Parser";
import { DiscordParser } from "@pipeline/parse/DiscordParser";
import { WhatsAppParser } from "@pipeline/parse/WhatsAppParser";
import { TelegramParser } from "@pipeline/parse/TelegramParser";

export interface InitMessage {
    platform: Platform;
    files: File[];
}

export interface ReportResult {
    type: "result";
    blob: Blob;
}

async function* run(msg: InitMessage): AsyncGenerator<StepInfo | ReportResult> {
    //
    // 1. Parse files
    //
    // Create parser
    let parser: Parser | null;
    switch (msg.platform) {
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
            throw new Error(`Unknown platform: ${msg.platform}`);
    }
    // Read files and parse
    yield { type: "new", title: "Read and parse files", total: msg.files.length };
    for (let i = 0; i < msg.files.length; i++) {
        const content = await msg.files[i].text();
        parser.parse(content);
        yield { type: "progress", progress: i + 1 };
    }
    yield { type: "done" };

    const database = parser.database;
    parser = null;

    //
    // 2. Preprocess database
    //
    console.log(database);

    yield { type: "result", blob: new Blob([JSON.stringify(database)], { type: "text/html" }) };
}

self.onmessage = async (ev: MessageEvent<InitMessage>) => {
    const gen = run(ev.data);
    for await (const packet of gen) {
        self.postMessage(packet);
    }
};

console.log("WorkerApp started");
