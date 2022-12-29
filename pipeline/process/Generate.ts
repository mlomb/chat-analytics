import { Database, ReportConfig } from "@pipeline/Types";
import { downloadFile, FileInput } from "@pipeline/File";
import { progress } from "@pipeline/Progress";
import { Parser } from "@pipeline/parse/Parser";
import { DiscordParser } from "@pipeline/parse/parsers/DiscordParser";
import { MessengerParser } from "@pipeline/parse/parsers/MessengerParser";
import { TelegramParser } from "@pipeline/parse/parsers/TelegramParser";
import { WhatsAppParser } from "@pipeline/parse/parsers/WhatsAppParser";
import { DatabaseBuilder } from "@pipeline/process/DatabaseBuilder";
import { compress } from "@pipeline/compression/Compression";

export const generateDatabase = async (files: FileInput[], config: ReportConfig): Promise<Database> => {
    const builder: DatabaseBuilder = new DatabaseBuilder(config);
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
        progress.new("Processing", file.name);
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
        progress.done();
    }

    // no longer needed
    parser = null;

    return builder.getDatabase();
};

// Returns the final data and HTML code
export const generateReportSite = async (
    database: Database
): Promise<{
    data: string;
    html: string;
}> => {
    // compress data
    progress.new("Compressing");
    const encodedData = compress(database);
    progress.done();

    progress.new("Downloading", "report HTML");
    const html = await downloadFile("/report.html", "text");
    progress.done();

    const template = "[[[DATA]]]";
    const dataTemplateLoc = html.indexOf(template);
    const finalHtml = html.slice(0, dataTemplateLoc) + encodedData + html.slice(dataTemplateLoc + template.length);

    return {
        data: encodedData,
        html: finalHtml,
    };
};
