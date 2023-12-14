import { gunzipSync, gzipSync } from "fflate";

import { base91decode, base91encode } from "@pipeline/compression/Base91";
import { Database } from "@pipeline/process/Types";

/**
 * Compress and encode the database into a string
 *
 * ((POJO -> TextEncoder) + Binary) -> Gzip -> Base91
 */
export const compressDatabase = (database: Database): string => {
    // variables must be declared with let and not const
    // so that we can release the memory when we are done with them

    let messages = database.messages;

    let json = JSON.stringify({
        ...database,
        // do not include messages in the JSON
        messages: undefined,
    });

    let jsonBuffer = new TextEncoder().encode(json);
    (json as any) = undefined; // release json string

    // Raw buffer format:
    //      <json buffer length> <messages length>
    //      <json buffer>        <messages buffer>

    let rawBuffer = new Uint8Array(4 * 2 + jsonBuffer.byteLength + messages.byteLength);
    let rawView = new DataView(rawBuffer.buffer);

    // write lengths
    rawView.setUint32(0, jsonBuffer.length);
    rawView.setUint32(4, messages.byteLength);

    // write buffers
    rawBuffer.set(jsonBuffer, 8);
    rawBuffer.set(messages, 8 + jsonBuffer.length);

    // release buffer
    (jsonBuffer as any) = undefined;

    let zippedBuffer = gzipSync(rawBuffer);
    (rawBuffer as any) = undefined;

    let encoded = base91encode(zippedBuffer);
    (zippedBuffer as any) = undefined;

    return encoded;
};

/**
 * Decode and decompress the database from a string
 *
 * Base91 -> Gunzip -> ((TextDecoder -> JSON.parse) + Binary)
 */
export const decompressDatabase = (data: string): Database => {
    const decoded = base91decode(data);
    const rawBuffer = gunzipSync(decoded);
    const rawView = new DataView(rawBuffer.buffer);

    // read lengths
    const jsonBufferLength = rawView.getUint32(0);
    const messagesLength = rawView.getUint32(4);

    // read buffers
    const jsonBuffer = rawBuffer.slice(8, 8 + jsonBufferLength);
    const messages = rawBuffer.slice(8 + jsonBufferLength, 8 + jsonBufferLength + messagesLength);

    const jsonString = new TextDecoder().decode(jsonBuffer);

    const database = JSON.parse(jsonString) as Database;
    database.messages = messages;

    return database;
};
