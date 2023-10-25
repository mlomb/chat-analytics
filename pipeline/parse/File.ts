import { Progress } from "@pipeline/Progress";
import { Timestamp } from "@pipeline/Types";
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

// This value has been hand-picked
const JSON_CHUNK_SIZE = 1024 * 1024 * 2; // 2MB

/** Streams a file into a JSONStream in 2MB chunks, optionally providing progress */
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

/**
 * Tries to find a timestamp at the end of a file, using the provided regex. The regex must have a capture group.
 * It can detect ISO 8601 dates and unix timestamps.
 *
 * This is useful to compute how up-to-date a file is before parsing it, so we can always keep the latest information (e.g. nicknames)
 */
export const tryToFindTimestampAtEnd = async (regex: RegExp, file: FileInput): Promise<Timestamp | undefined> => {
    // read last 4KB of file
    const buffer = await file.slice(Math.max(0, file.size - 4096), file.size);
    const text = new TextDecoder().decode(buffer);

    // try to match
    const match = Array.from(text.matchAll(regex));
    const lastMatch = match.pop();

    if (lastMatch && lastMatch.length >= 2) {
        const found = lastMatch[1];
        let ts: Timestamp;

        if (found.includes("T")) {
            // try to parse as ISO 8601 date
            ts = new Date(found).getTime();
        } else {
            // try to parse as unix timestamp
            ts = parseInt(found, 10);
        }

        if (!isNaN(ts)) return ts;
    }

    return undefined;
};
