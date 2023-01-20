import fs from "fs";
import path from "path";

import { Env, LoadAssetFn } from "@pipeline/Env";
import { FileInput } from "@pipeline/File";

// Loads a file from disk and wraps it into our abstraction
export const loadFile = (filepath: string): FileInput => {
    const content = fs.readFileSync(filepath);
    const stats = fs.statSync(filepath);

    return {
        name: filepath,
        size: stats.size,
        lastModified: stats.mtimeMs,
        slice: async (start, end) => content.subarray(start, end),
    };
};

const loadAsset: LoadAssetFn = async (filepath: string, type: "json" | "text" | "arraybuffer") => {
    if (process.env.NODE_ENV === "test") {
        // during tests, the tests are run from the original .ts files
        filepath = path.join(__dirname, "..", "assets", filepath);
    } else {
        // used when the package is deployed in dist/
        filepath = path.join(__dirname, "..", "..", "assets", filepath);
    }

    // hardcode the report.html file
    // we probably want to not do this, but because all assets live inside the assets folder
    // but the report is generated in dist_web/ is a bit of a pain
    if (filepath.endsWith("report.html")) {
        // we assume we don't test with the report.html file
        filepath = path.join(__dirname, "..", "..", "dist_web", "report.html");
    }

    const content = fs.readFileSync(filepath);

    if (type === "text") return content.toString("utf-8");
    else if (type === "json") return JSON.parse(content.toString("utf-8"));
    else return content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength);
};

export const NodeEnv: Env = {
    loadAsset,
};
