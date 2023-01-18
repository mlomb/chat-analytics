import { Parser } from "@pipeline/parse/Parser";
import { FileInput } from "@pipeline/File";
import { AttachmentType } from "@pipeline/Types";

export class MessengerParser extends Parser {
    private messageIndex = 0;

    sortFiles(files: FileInput[]): FileInput[] {
        // we are expecting files like "message_<number>.json"
        // where the lower the number, the newer the messages
        // so if we have 4 files, we want to process them in this order: 4, 3, 2, 1
        const extractNumber = (name: string) => {
            const match = name.match(/message_(\d+)\.json/);
            return match ? parseInt(match[1]) : 0;
        };
        return files.sort((a, b) => extractNumber(b.name) - extractNumber(a.name));
    }

    // Note: we might want to support the ZIP files provided by Facebook
    // there are two problems with this:
    // 1. there are many channels and users, combining them together would be a mess
    // 2. the ZIP files are very big, including lots of media files so loading the whole ZIP into memory is not feasible
    //
    // so, we just assume the user will provide the appropriate "message_<number>.json" files
    async *parse(file: FileInput) {
        const fileBuffer = await file.slice();
        const textContent = new TextDecoder("utf-8").decode(fileBuffer);

        // fortunately, there are only 10k messages per file,
        // so we can just parse the whole file at once :)
        const fileContent = JSON.parse(textContent) as MessengerExportFile;

        const guildIndex = this.builder.addGuild(fileContent.thread_path, {
            name: fileContent.title,
        });
        const assignedChannelIndex = this.builder.addChannel(fileContent.thread_path, {
            name: fileContent.title,
            guildIndex: guildIndex,
            type: "group", // TODO!
        });

        // we iterate the messages in reverse order since we want to iterate from older to newer
        for (const message of fileContent.messages.reverse()) {
            const authorIndex = this.builder.addAuthor(message.sender_name, {
                n: message.sender_name,
            });

            this.builder.addMessage({
                id: this.messageIndex++,
                timestamp: message.timestamp_ms,
                authorIndex,
                channelIndex: assignedChannelIndex,
                content: message.content,
                attachments: this.parseAttachments(message),
                reactions: [],
            });

            yield;
        }
    }

    parseAttachments(message: MessengerMessage): AttachmentType[] {
        const attachments: AttachmentType[] = [];
        if (message.photos) {
            for (const photo of message.photos) {
                attachments.push(AttachmentType.Image);
            }
        }
        if (message.audio_files) {
            for (const audio of message.audio_files) {
                attachments.push(AttachmentType.Audio);
            }
        }
        if (message.files) {
            for (const file of message.files) {
                attachments.push(AttachmentType.Other);
            }
        }
        if (message.sticker) {
            attachments.push(AttachmentType.Sticker);
        }
        return attachments;
    }
}
