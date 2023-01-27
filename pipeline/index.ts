import { Env } from "@pipeline/Env";
import { ReportConfig } from "@pipeline/Types";
import { FileInput } from "@pipeline/parse/File";

import { compress } from "./compression/Compression";
import { createParser } from "./parse";
import { Processor } from "./process/Processor";
import { Database } from "./process/Types";

export const generateDatabase = async (files: FileInput[], config: ReportConfig, env: Env): Promise<Database> => {
    const parser = createParser(config.platform);

    const processor = new Processor(parser, config, env);

    await processor.init();

    for (const file of files) {
        for await (const _ of parser.parse(file)) processor.process();
        processor.markEOF();
        processor.process();
    }

    return processor.getDatabase();
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
