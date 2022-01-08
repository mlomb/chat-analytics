import { AttachmentType } from "@pipeline/Types";

// prettier-ignore
const FilenamePatterns = [
    "WhatsApp Chat - ",
    "WhatsApp Chat with ",
    "Chat de WhatsApp con "
];

export const extractChatName = (filename: string): string | undefined => {
    let name: string | undefined;
    for (const template of FilenamePatterns) {
        // expected: <pattern><chat name>.txt
        if (filename.startsWith(template) && filename.endsWith(".txt")) {
            name = filename.slice(template.length, -".txt".length);
            break;
        }
    }
    return name;
};

// prettier-ignore
const MediaOmittedTemplates = [
    "<Media omitted>",
    "<Multimedia omitido>"
];

export const matchAttachmentType = (input: string): AttachmentType | undefined => {
    const _input = input.trim();
    if (MediaOmittedTemplates.includes(_input)) {
        // we can't know what type it is 😢
        return AttachmentType.Other;
    }
    return undefined;
};
