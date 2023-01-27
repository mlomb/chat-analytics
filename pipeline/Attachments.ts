export enum AttachmentType {
    Image,
    ImageAnimated, // (GIFs)
    Video,
    Sticker,
    Audio,
    Document,
    Other,
}

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
