import { JSONStream } from "@pipeline/parse/JSONStream";
import { progress } from "@pipeline/Progress";
import { AttachmentType } from "@pipeline/Types";

// interface for file to be parsed
export interface FileInput {
    name: string;
    size: number;
    lastModified: number;
    slice(start?: number, end?: number): Promise<ArrayBuffer>;
}

// Wraps a string into our file abstraction
// Convenient for testing
export const wrapStringAsFile = (content: string): FileInput => {
    const buffer = new TextEncoder().encode(content);

    return {
        name: "file" + content.length,
        size: content.length,
        lastModified: Date.now(),
        slice: async (start: number, end: number) => buffer.slice(start, end),
    };
};

const JSON_CHUNK_SIZE = 1024 * 1024 * 2; // 2MB
export const streamJSONFromFile = async function* (stream: JSONStream, file: FileInput): AsyncGenerator<void> {
    const fileSize = file.size;
    const textDecoder = new TextDecoder("utf-8");

    let receivedLength = 0;
    while (receivedLength < fileSize) {
        const buffer = await file.slice(receivedLength, receivedLength + JSON_CHUNK_SIZE);
        const str = textDecoder.decode(buffer, { stream: true });
        receivedLength += buffer.byteLength;
        stream.push(str);
        progress.progress("bytes", receivedLength, fileSize);
        yield;
    }
};

const ATTACHMENT_EXTS: {
    [key in AttachmentType]?: string[];
} = {
    [AttachmentType.Image]: ["png", "jpg", "jpeg", "webp", "bmp", "tiff", "tif", "svg", "ico", "psd"],
    [AttachmentType.ImageAnimated]: ["gif", "gifv", "apng"],
    [AttachmentType.Video]: ["mp4", "webm", "mkv", "flv", "mov", "avi", "wmv", "mpg", "mpeg", "avi"],
    [AttachmentType.Audio]: ["mp3", "ogg", "wav", "flac", "m4a"],
    [AttachmentType.Document]: ["doc", "docx", "odt", "pdf", "xls", "xlsx", "ods", "ppt", "pptx", "txt", "html"],
};
export const getAttachmentTypeFromFileName = (filename: string): AttachmentType => {
    const ext = (filename.split(".").pop() || "").toLocaleLowerCase();
    for (let type: AttachmentType = 0; type <= AttachmentType.Other; type++) {
        if (ATTACHMENT_EXTS[type]?.includes(ext)) return type;
    }
    // unknown or generic
    return AttachmentType.Other;
};

const DOC_MIME_TYPES: string[] = [
    "application/pdf",
    "application/epub",
    "application/epub+zip",
    "text/html",
    "application/rtf",
    "application/msword",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
];
export const getAttachmentTypeFromMimeType = (mimeType: string): AttachmentType => {
    mimeType = mimeType.toLocaleLowerCase();

    if (mimeType.startsWith("image/gif")) return AttachmentType.ImageAnimated;
    if (mimeType.startsWith("image/")) return AttachmentType.Image;
    if (mimeType.startsWith("video/")) return AttachmentType.Video;
    if (mimeType.startsWith("audio/")) return AttachmentType.Audio;
    if (DOC_MIME_TYPES.includes(mimeType)) return AttachmentType.Document;

    // console.log(`Unknown mime type: ${mimeType}`);

    // unknown or generic
    return AttachmentType.Other;
};
