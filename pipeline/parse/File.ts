import { Progress } from "@pipeline/Progress";
import { JSONStream } from "@pipeline/parse/JSONStream";

/** Our interface for input files. Environment agnostic */
export interface FileInput {
    name: string;
    size: number;
    lastModified: number;
    slice(start?: number, end?: number): Promise<ArrayBuffer>;
}

/** Wraps a string into our file abstraction. Useful for testing */
export const wrapStringAsFile = (content: string): FileInput => {
    const buffer = new TextEncoder().encode(content);

    return {
        name: "file" + content.length,
        size: content.length,
        lastModified: Date.now(),
        slice: async (start: number, end: number) => buffer.slice(start, end),
    };
};

// This value has been hand picked
const JSON_CHUNK_SIZE = 1024 * 1024 * 2; // 2MB

export const streamJSONFromFile = async function* (
    stream: JSONStream,
    file: FileInput,
    progress?: Progress
): AsyncGenerator<void> {
    const fileSize = file.size;
    const textDecoder = new TextDecoder("utf-8");

    let receivedLength = 0;
    while (receivedLength < fileSize) {
        const buffer = await file.slice(receivedLength, receivedLength + JSON_CHUNK_SIZE);
        const str = textDecoder.decode(buffer, { stream: true });
        receivedLength += buffer.byteLength;
        stream.push(str);
        progress?.progress("bytes", receivedLength, fileSize);
        yield;
    }
};
