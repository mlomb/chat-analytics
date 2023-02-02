import { Env } from "@pipeline/Env";
import { ReportConfig } from "@pipeline/Types";
import { compress } from "@pipeline/compression/Compression";
import { FileInput } from "@pipeline/parse/File";
import { DatabaseBuilder } from "@pipeline/process/DatabaseBuilder";
import { Database } from "@pipeline/process/Types";

export const generateDatabase = async (files: FileInput[], config: ReportConfig, env: Env): Promise<Database> => {
    const builder = new DatabaseBuilder(config, env);
    await builder.init();
    await builder.processFiles(files);
    return builder.build();
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
