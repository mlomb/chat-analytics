import { AttachmentType, getAttachmentTypeFromFileName, getAttachmentTypeFromMimeType } from "@pipeline/Attachments";

it.each([
    ["image.png", AttachmentType.Image],
    ["image.jpg", AttachmentType.Image],
    ["image.webp", AttachmentType.Image],
    ["animated.gif", AttachmentType.ImageAnimated],
    ["video.mp4", AttachmentType.Video],
    ["audio.mp3", AttachmentType.Audio],
    ["document.pdf", AttachmentType.Document],
    ["crazy.coco", AttachmentType.Other],
])("should attachment of filename: %s", (filename, attachmentTypeExpected) => {
    expect(getAttachmentTypeFromFileName(filename)).toBe(attachmentTypeExpected);
});

it.each([
    ["image/png", AttachmentType.Image],
    ["image/jpeg", AttachmentType.Image],
    ["image/webp", AttachmentType.Image],
    ["image/gif", AttachmentType.ImageAnimated],
    ["video/mp4", AttachmentType.Video],
    ["audio/mpeg", AttachmentType.Audio],
    ["application/pdf", AttachmentType.Document],
    ["application/coco", AttachmentType.Other],
])("should recognize attachment of MIME type: %s", (filename, attachmentTypeExpected) => {
    expect(getAttachmentTypeFromMimeType(filename)).toBe(attachmentTypeExpected);
});
