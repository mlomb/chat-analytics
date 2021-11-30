import { FileInput, ReportConfig, StepInfo } from "@pipeline/Types";
import { Parser } from "@pipeline/parse/Parser";
import { DiscordParser } from "@pipeline/parse/DiscordParser";
import { WhatsAppParser } from "@pipeline/parse/WhatsAppParser";
import { TelegramParser } from "@pipeline/parse/TelegramParser";

export async function* generateReport(files: FileInput[], config: ReportConfig): AsyncGenerator<StepInfo> {
    //
    // 1. Parse files
    //
    // Create parser
    let parser: Parser | null;
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
    yield { type: "new", title: "Read and parse files", total: files.length };
    for (let i = 0; i < files.length; i++) {
        const content = await files[i].text();
        try {
            parser.parse(content);
        } catch (ex) {
            throw new Error(`Error parsing file "${files[i].name}":\n${(ex as Error).message}`);
        }
        yield { type: "progress", progress: i + 1 };
    }
    yield { type: "done" };

    const database = parser.database;
    parser = null;

    //
    // 2. Preprocess database
    //
    console.log(database);

    // TEMPORAL
    // GENERATE RANDOM STUFF
    for (let j = 0; j < 15; j++) {
        const total = Math.floor(Math.random() * 50);
        yield { type: "new", title: "thing " + j, total };
        for (let i = 0; i < total; i++) {
            yield { type: "progress", progress: i + 1 };
            await new Promise((resolve) => setTimeout(resolve, Math.random() * 5));
        }
        yield { type: "done" };
    }

    const html = "Aqui pondria un reporte si lo hubiera generado";

    yield {
        type: "result",
        title: database.title,
        html,
        time: Date.now(),
        counts: {
            authors: database.authors.size,
            channels: database.channels.size,
            messages: Object.values(database.messages).reduce((acc, val) => acc + val.length, 0),
        },
    };
}
