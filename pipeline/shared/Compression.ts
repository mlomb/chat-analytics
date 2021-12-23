import { ReportData, SerializedData } from "@pipeline/process/ReportData";

import { gzipSync, gunzipSync } from "fflate";
import { Base91Decoder, Base91Encoder } from "@pipeline/shared/Base91";

/*
    Compression and decompression of the ReportData object and SerializedData buffer

    
    Data format: <json buffer length> <serialized data length> <json buffer> <serialized data buffer>
*/

// ((POJO -> TextEncoder) + Binary) -> Gzip -> Base91
function compress(reportData: ReportData, serializedData: SerializedData): string {
    const json = JSON.stringify(reportData);
    const jsonBuffer = new TextEncoder().encode(json);

    const rawBuffer = new Uint8Array(4 * 2 + jsonBuffer.length + serializedData.byteLength);
    const rawView = new DataView(rawBuffer.buffer);

    rawView.setUint32(0, jsonBuffer.length);
    rawView.setUint32(4, serializedData.byteLength);
    rawBuffer.set(jsonBuffer, 8);
    rawBuffer.set(serializedData, 8 + jsonBuffer.length);

    const zippedBuffer = gzipSync(rawBuffer);
    const encoded = new Base91Encoder().encode(zippedBuffer, true);

    return encoded;
}

// Base91 -> Gunzip -> ((TextDecoder -> JSON.parse) + Binary)
function decompress(data: string): [ReportData, SerializedData] {
    const decoded = new Base91Decoder().decode(data, true);
    const rawBuffer = gunzipSync(decoded);
    const rawView = new DataView(rawBuffer.buffer);

    const jsonBufferLength = rawView.getUint32(0);
    const serializedDataLength = rawView.getUint32(4);

    const jsonBuffer = rawBuffer.slice(8, 8 + jsonBufferLength);
    const serializedData = rawBuffer.slice(8 + jsonBufferLength, 8 + jsonBufferLength + serializedDataLength);

    const textDecoder = new TextDecoder();
    const jsonString = textDecoder.decode(jsonBuffer);
    const reportData = JSON.parse(jsonString) as ReportData;

    return [reportData, serializedData];
}

export { compress, decompress };
