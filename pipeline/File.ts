import { JSONStream } from "@pipeline/parse/JSONStream";
import { progress } from "@pipeline/Progress";

// interface for file to be parsed
export interface FileInput {
    name: string;
    size: number;
    slice(start?: number, end?: number): Promise<ArrayBuffer>;
}

export const streamJSONFromFile = async (stream: JSONStream, file: FileInput) => {
    const CHUNK_SIZE = 1024 * 1024 * (2 * 2); // 4MB
    const textDecoder = new TextDecoder("utf-8");
    const fileSize = file.size;

    let receivedLength = 0;
    while (receivedLength < fileSize) {
        const buffer = await file.slice(receivedLength, receivedLength + CHUNK_SIZE);
        const str = textDecoder.decode(buffer, { stream: true });
        receivedLength += buffer.byteLength;
        stream.push(str, receivedLength >= fileSize);

        progress.progress("bytes", receivedLength, fileSize);
    }
};

export const downloadFile = async (filepath: string): Promise<string> => {
    // TODO: progress
    const req = await fetch(filepath);
    const text = await req.text();
    return text;
};
