import { gunzipSync, gzipSync } from "fflate";

import { Database } from "@pipeline/Types";
import { base91decode, base91encode } from "@pipeline/compression/Base91";

/*
    Compression and decompression of the Database
*/

// ((POJO -> TextEncoder) + Binary) -> Gzip -> Base91
function compress(database: Database): string {
    let serializedBuffer = database.serialized;
    if (serializedBuffer === undefined) throw new Error("Serialized data is undefined");

    let json = JSON.stringify({
        ...database,
        serialized: undefined,
    });

    let jsonBuffer = new TextEncoder().encode(json);
    (json as any) = undefined;

    // Raw buffer format: <json buffer length> <serialized data length> <json buffer> <serialized data buffer>
    // TODO: avoid generating a new buffer, instead use streaming
    let rawBuffer = new Uint8Array(4 * 2 + jsonBuffer.length + serializedBuffer.byteLength);
    let rawView = new DataView(rawBuffer.buffer);

    rawView.setUint32(0, jsonBuffer.length);
    rawView.setUint32(4, serializedBuffer.byteLength);
    rawBuffer.set(jsonBuffer, 8);
    rawBuffer.set(serializedBuffer, 8 + jsonBuffer.length);

    // release buffers
    (jsonBuffer as any) = undefined;
    (serializedBuffer as any) = undefined;

    let zippedBuffer = gzipSync(rawBuffer);
    (rawBuffer as any) = undefined;
    let encoded = base91encode(zippedBuffer);
    (zippedBuffer as any) = undefined;

    return encoded;
}

// Base91 -> Gunzip -> ((TextDecoder -> JSON.parse) + Binary)
function decompress(data: string): Database {
    const decoded = base91decode(data);
    (data as any) = undefined;
    const rawBuffer = gunzipSync(decoded);
    const rawView = new DataView(rawBuffer.buffer);

    const jsonBufferLength = rawView.getUint32(0);
    const serializedDataLength = rawView.getUint32(4);

    const jsonBuffer = rawBuffer.slice(8, 8 + jsonBufferLength);
    const serializedData = rawBuffer.slice(8 + jsonBufferLength, 8 + jsonBufferLength + serializedDataLength);

    const textDecoder = new TextDecoder();
    const jsonString = textDecoder.decode(jsonBuffer);
    console.log("JSON string length", jsonString.length);
    const database = JSON.parse(jsonString) as Database;
    database.serialized = serializedData;

    return database;
}

export { compress, decompress };
