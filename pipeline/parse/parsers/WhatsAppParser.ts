import { AttachmentType, IMessage } from "@pipeline/Types";
import { FileInput } from "@pipeline/File";
import { Parser } from "@pipeline/parse/Parser";
import { extractChatName, matchAttachmentType } from "@pipeline/parse/parsers/WhatsApp";

/*
    There is a convenient parser already out there
*/
import { parseStringSync } from "whatsapp-chat-parser";

export class WhatsAppParser extends Parser {
    private channelIndex = 0;
    private messageIndex = 0;

    async *parse(file: FileInput) {
        const file_buffer = await file.slice();
        const file_content = new TextDecoder("utf-8").decode(file_buffer);
        const parsed = parseStringSync(file_content);

        // try to extract the chat name from the filename
        let name: string | undefined = extractChatName(file.name);

        const numAuthors = new Set(parsed.filter((m) => m.author !== "System").map((m) => m.author)).size;
        const isGroup = numAuthors > 2;

        // if the chat is not a group, add "Chat with " to the name
        if (name && !isGroup) name = `Chat with ${name}`;

        // if we have a name and this is the first channel, set as the report title
        if (name && this.channelIndex === 0) {
            this.builder.setTitle(name);
        } else {
            // set default report name
            this.builder.setTitle(`WhatsApp chat${this.channelIndex > 0 ? "s" : ""}`);
        }

        const channelIndex = this.channelIndex++;
        const channelId = this.builder.addChannel(channelIndex, {
            n: name || `Channel #${channelIndex}`,
        });

        for (const message of parsed) {
            const timestamp = message.date.getTime();

            if (message.author !== "System") {
                const authorId = this.builder.addAuthor(message.author, {
                    n: message.author,
                });
                const imsg: IMessage = {
                    id: this.messageIndex++,
                    authorId,
                    channelId,
                    timestamp,
                };

                const attachment: AttachmentType | undefined = matchAttachmentType(message.message);
                if (attachment !== undefined) {
                    imsg.attachment = attachment;
                } else {
                    // copy text content
                    imsg.content = message.message;
                }

                console.log(imsg);

                this.builder.addMessage(imsg);
            } else {
                // TODO: parse system messages
            }
        }
    }
}
