import { Gzip, Gunzip } from "fflate";
import { Base91Decoder, Base91Encoder } from "@pipeline/shared/Base91";

import { StepInfo } from "@pipeline/Types";
import { ProcessedData } from "@pipeline/preprocess/ProcessedData";
import JSONStream from "@pipeline/shared/JSONStream";

/*
    Compression and decompression of the ProcessedData object
*/

// POJO -> TextEncoder -> Gzip -> Base91 (as blob)
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
    const MAX_PART_SIZE = 1024 * 1024 * 8; // in chars
    const object = data as any;
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

// Base91 -> Gunzip -> TextDecoder -> JSON.parse
const decompress = (data: string): Promise<ProcessedData> =>
    new Promise((resolve, reject) => {
        const CHUNK_SIZE = 1024 * 128; // 128K of base91 chars (~3-4MB of JSON)
        const base91 = new Base91Decoder();
        const textDecoder = new TextDecoder("utf-8");
        const gunzipStream = new Gunzip();
        const jsonStream = new JSONStream();
        jsonStream.onRoot<ProcessedData>((data) => resolve(data));

        let offset = 0;
        let gotChunk = false;
        function nextChunk() {
            const chunk = data.slice(offset, offset + CHUNK_SIZE);
            const last = chunk.length < CHUNK_SIZE;
            const decoded = base91.decode(chunk, last);
            offset += CHUNK_SIZE;

            try {
                gotChunk = false;
                gunzipStream.push(decoded, last);
                if (!gotChunk) nextChunk();
            } catch (e) {
                reject(e);
            }
        }

        gunzipStream.ondata = (chunk, final) => {
            gotChunk = true;
            const decoded = textDecoder.decode(chunk, { stream: true });
            jsonStream.push(decoded, final);

            // use setTimeout to avoid stack overflow,
            // also fflate breaks if we don't (drove me nuts)
            if (!final) setTimeout(nextChunk, 0);
        };

        // start
        nextChunk();
    });

export { compress, decompress };
