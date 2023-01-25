import { Env } from "@pipeline/Env";
import { Database, ReportConfig } from "@pipeline/Types";
import { compress } from "@pipeline/compression/Compression";
import { createParser } from "@pipeline/parse";
import { FileInput } from "@pipeline/parse/File";
import { DatabaseBuilder } from "@pipeline/process/DatabaseBuilder";

export const generateDatabase = async (files: FileInput[], config: ReportConfig, env: Env): Promise<Database> => {
    env.progress?.stat("total_files", files.length);

    const builder: DatabaseBuilder = new DatabaseBuilder(config, env);
    // load data needed for processing
    await builder.init();

    const parser = createParser(config.platform);

    parser.on("guild", (at, guild) => console.log("at", at, "guild", guild));
    parser.on("channel", (at, channel) => console.log("at", at, "channel", channel));
    parser.on("author", (at, author) => console.log("at", at, "author", author));
    parser.on("message", (at, message) => console.log("at", at, "message", message));

    // parse and process all files
    let processed = 0;
    for (const file of files) {
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
        env.progress?.stat("processed_files", ++processed);
    }

    return builder.getDatabase();
};

// Returns the final data and HTML code
export const generateReport = async (
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

    // build title to avoid HTML injections (just so it doesn't break)
    const title = database.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    let html = await env.loadAsset("/report.html", "text");
    html = html.replace("[[TITLE]]", `${title} - Chat Analytics`);

    // we can't use replace for the data, if the data is too large it will cause a crash
    const template = "[[[DATA]]]";
    const dataTemplateLoc = html.indexOf(template);
    const finalHtml = html.slice(0, dataTemplateLoc) + encodedData + html.slice(dataTemplateLoc + template.length);

    return {
        data: encodedData,
        html: finalHtml,
    };
};
