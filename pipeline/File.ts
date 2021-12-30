import { JSONStream } from "@pipeline/parse/JSONStream";
import { progress } from "@pipeline/Progress";

// interface for file to be parsed
export interface FileInput {
    name: string;
    size: number;
    slice(start?: number, end?: number): Promise<ArrayBuffer>;
}

export const streamJSONFromFile = async function* (stream: JSONStream, file: FileInput): AsyncGenerator<void> {
    const CHUNK_SIZE = 1024 * 1024 * (2 * 2); // 4MB
    const textDecoder = new TextDecoder("utf-8");
    const fileSize = file.size;

    let receivedLength = 0;
    while (receivedLength < fileSize) {
        const buffer = await file.slice(receivedLength, receivedLength + CHUNK_SIZE);
        const str = textDecoder.decode(buffer, { stream: true });
        receivedLength += buffer.byteLength;
        stream.push(str);
        progress.progress("bytes", receivedLength, fileSize);
        yield;
    }
};

export const downloadTextFile = async (filepath: string): Promise<string> => {
    // TODO: progress
    const req = await fetch(filepath);
    const text = await req.text();
    return text;
};

export const downloadBinaryFile = async (filepath: string): Promise<Uint8Array> => {
    // TODO: progress
    const req = await fetch(filepath);
    const bytes = await req.arrayBuffer();
    return new Uint8Array(bytes);
};
