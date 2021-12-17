import { Gzip } from "fflate";

import { StepInfo } from "@pipeline/Types";
import { ProcessedData } from "@pipeline/preprocess/ProcessedData";

/*
    Compression and decompression of the ProcessedData object
*/

async function* compress(data: ProcessedData): AsyncGenerator<StepInfo, Blob> {
    // https://en.wikipedia.org/wiki/Binary-to-text_encoding
    /*
https://news.ycombinator.com/item?id=13049329
Raw size:     37409
  gzip(raw):    6170
  gzip(base16): 7482
  gzip(base64): 10675
  gzip(base85): 10549
So it works better than base64, and it has the advantage of working 4 bytes at a time rather than 3.
Also note that when you're feeding in binary data the gzip sizes for raw and base-xx data get a lot closer together.




    */
    const gzipStream = new Gzip();

    const blobParts: BlobPart[] = [];
    gzipStream.ondata = (chunk) => blobParts.push(chunk);

    // For the love of god, find a better way to do this
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

    return new Blob(blobParts, { type: "application/gzip" });
}

const decompress = async (data: string): Promise<ProcessedData> => {
    return {} as ProcessedData;
};

export { compress, decompress };
