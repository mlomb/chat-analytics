import { StepMessage } from "@pipeline/Messages";
import { FileInput, ReportConfig } from "@pipeline/Types";
import { downloadFile } from "@pipeline/Utils";
import { Parser } from "@pipeline/parse/Parser";
import { DiscordParser } from "@pipeline/parse/DiscordParser";
import { WhatsAppParser } from "@pipeline/parse/WhatsAppParser";
import { TelegramParser } from "@pipeline/parse/TelegramParser";
import { preprocess } from "@pipeline/preprocess/Preprocess";
import { Database } from "@pipeline/parse/Database";
import { ProcessedData } from "@pipeline/preprocess/ProcessedData";
import { compress } from "@pipeline/shared/Compression";

export async function* generateReport(files: FileInput[], config: ReportConfig): AsyncGenerator<StepMessage> {
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
            if (env.isDev) throw ex;
            throw new Error(`Error parsing file "${files[i].name}":\n${(ex as Error).message}`);
        }
        yield { type: "done" };
    }

    let database: Database | null = parser.database;
    // release other parser memory
    parser = null;

    console.log(database);

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

    // save info
    const title = database.title;
    const counts = {
        authors: database.authors.length,
        channels: database.channels.length,
        messages: Object.values(database.messages).reduce((acc, val) => acc + val.length, 0),
    };

    //
    // 2. Preprocess database
    //
    let preprocessed: ProcessedData | null = yield* preprocess(database, config);
    // release db memory
    database = null;

    //
    // 3. Compress data
    //
    yield { type: "new", title: "Compress data" };
    const dataBlob = yield* compress(preprocessed);
    // release preprocessed memory
    preprocessed = null;
    yield { type: "done" };

    //
    // 4. Export
    //
    const html = yield* downloadFile("report.html");
    const template = "[[[DATA]]]";
    const dataTemplateLoc = html.indexOf(template);
    const htmlBlob = new Blob(
        [html.slice(0, dataTemplateLoc), dataBlob, html.slice(dataTemplateLoc + template.length)],
        { type: "text/html" }
    );

    yield {
        type: "result",
        title,
        dataBlob,
        htmlBlob,
        time: Date.now(),
        counts,
    };
}
