import { Gzip, gunzipSync } from "fflate";
import { Base91Decoder, Base91Encoder } from "@pipeline/shared/Base91";

import { StepInfo } from "@pipeline/Types";
import { ProcessedData } from "@pipeline/preprocess/ProcessedData";

/*
    Compression and decompression of the ProcessedData object
*/

async function* compress(data: ProcessedData): AsyncGenerator<StepInfo, Blob> {
    // stats
    let rawJSONSize = 0;
    let compressedSize = 0;
    let encodedSize = 0;

    const base91 = new Base91Encoder();
    const gzipStream = new Gzip();

    const blobParts: string[] = [];
    gzipStream.ondata = (chunk, final) => {
        compressedSize += chunk.length;
        const encoded = base91.encode(chunk, final);
        encodedSize += encoded.length;
        blobParts.push(encoded);
    };

    // For the love of god, find a better way to do this
    /* ============================= */
    /* =============💩============= */
    /* ============================= */
    const object = data as any;
    const MAX_PART_SIZE = 1024 * 1024 * 8; // in chars
    const keys = Object.keys(object);
    const te = new TextEncoder();

    let buffer = "";
    const flush = (last: boolean = false) => {
        gzipStream.push(te.encode(buffer), last);
        buffer = "";
    };
    const append = (chunk: string) => {
        rawJSONSize += chunk.length;
        buffer += chunk;
        if (buffer.length > MAX_PART_SIZE) flush();
    };

    append("{");
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = object[key];

        if (i) append(",");
        append(`"${key}":`);

        if (Array.isArray(value)) {
            append("[");
            for (let j = 0; j < value.length; j++) {
                if (j) append(",");
                append(JSON.stringify(value[j]));
                // release
                value[j] = undefined;
            }
            append("]");
        } else {
            append(JSON.stringify(value));
        }
        // release
        object[key] = undefined;
    }
    append(`}`);
    flush(true);
    /* ============================= */
    /* ============================= */
    /* ============================= */

    console.log("rawJSONSize", rawJSONSize, "compressedSize", compressedSize, "encodedSize", encodedSize);

    return new Blob(blobParts, { type: "text/plain" });
}

const decompress = async (data: string): Promise<ProcessedData> => {
    // TODO: stream this
    const base91 = new Base91Decoder();
    const buffer = base91.decode(data, true);
    const jsonBuffer = gunzipSync(buffer);
    const json = new TextDecoder().decode(jsonBuffer);
    const out = JSON.parse(json) as ProcessedData;
    return out;
};

export { compress, decompress };
