import { Env } from "@pipeline/Env";
import { FileInput } from "@pipeline/File";
import { Database, ReportConfig } from "@pipeline/Types";
import { compress } from "@pipeline/compression/Compression";
import { Parser } from "@pipeline/parse/Parser";
import { DiscordParser } from "@pipeline/parse/parsers/DiscordParser";
import { MessengerParser } from "@pipeline/parse/parsers/MessengerParser";
import { TelegramParser } from "@pipeline/parse/parsers/TelegramParser";
import { WhatsAppParser } from "@pipeline/parse/parsers/WhatsAppParser";
import { DatabaseBuilder } from "@pipeline/process/DatabaseBuilder";

export const generateDatabase = async (files: FileInput[], config: ReportConfig, env: Env): Promise<Database> => {
    const builder: DatabaseBuilder = new DatabaseBuilder(config, env);
    // load data needed for processing
    await builder.init();

    // create parser
    let parser: Parser | null = null;
    switch (config.platform) {
        case "discord":
            parser = new DiscordParser(builder);
            break;
        case "messenger":
            parser = new MessengerParser(builder);
            break;
        case "whatsapp":
            parser = new WhatsAppParser(builder);
            break;
        case "telegram":
            parser = new TelegramParser(builder);
            break;
        default:
            throw new Error(`Unknown platform: ${config.platform}`);
    }

    // parse and process all files
    for (const file of parser.sortFiles(files)) {
        env.progress?.new("Processing", file.name);
        try {
            for await (const _ of parser.parse(file)) builder.process();
            builder.process(true);
        } catch (err) {
            if (err instanceof Error) {
                const newErr = new Error(`Error parsing file "${file.name}":\n\n${err.message}`);
                newErr.stack = err.stack;
                throw newErr;
            }
            // handled by WorkerApp.ts
            throw err;
        }
        env.progress?.done();
    }

    // no longer needed
    parser = null;

    return builder.getDatabase();
};

// Returns the final data and HTML code
export const generateReportSite = async (
    database: Database,
    env: Env
): Promise<{
    data: string;
    html: string;
}> => {
    // compress data
    env.progress?.new("Compressing");
    const encodedData = compress(database);
    env.progress?.done();

    const html = await env.loadAsset("/report.html", "text");

    const template = "[[[DATA]]]";
    const dataTemplateLoc = html.indexOf(template);
    const finalHtml = html.slice(0, dataTemplateLoc) + encodedData + html.slice(dataTemplateLoc + template.length);

    return {
        data: encodedData,
        html: finalHtml,
    };
};
