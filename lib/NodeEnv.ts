import fs from "fs";
import path from "path";

import { LoadAssetFn } from "@pipeline/Env";
import { FileInput } from "@pipeline/parse/File";

/** Loads a file from disk and wraps it into our file abstraction */
export const loadFile = (filepath: string): FileInput => {
    const stats = fs.statSync(filepath);
    const fd = fs.openSync(filepath, "r");

    return {
        name: filepath,
        size: stats.size,
        lastModified: stats.mtimeMs,
        slice: async (start, end) => {
            start = start ?? 0;
            end = end ?? stats.size;
            const buffer = Buffer.alloc(end - start);

            fs.readSync(fd, buffer, {
                length: end - start,
                position: start,
            });

            return buffer;
        },
    };
};

/** Loads assets when running in a Node.js process */
export const loadNodeAsset: LoadAssetFn = async (filepath: string, type: "json" | "text" | "arraybuffer") => {
    let rootDir: string;

    if (process.env.NODE_ENV === "test") {
        // during tests, the tests are run from the original .ts files
        rootDir = path.join(__dirname, "..");
    } else {
        // otherwise, the package is deployed in dist/
        rootDir = path.join(__dirname, "..", "..");
    }

    filepath = path.join(rootDir, "assets", filepath);

    // hardcode the report.html file
    // we probably don't want to do this, but because all assets live inside the assets folder
    // and the report is generated in dist_web/ is a bit of a pain
    if (filepath.endsWith("report.html")) {
        // we assume we don't test with the report.html file
        filepath = path.join(rootDir, "dist_web", "report.html");
    }

    const content = fs.readFileSync(filepath);

    if (type === "text") return content.toString("utf-8");
    else if (type === "json") return JSON.parse(content.toString("utf-8"));
    else return content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength);
};
