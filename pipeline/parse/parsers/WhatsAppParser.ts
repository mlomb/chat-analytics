import { FileInput } from "@pipeline/File";
import { Parser } from "@pipeline/parse/Parser";

/*
    There is a convenient parser already out there
*/
import { parseStringSync } from "whatsapp-chat-parser";

export class WhatsAppParser extends Parser {
    private channelIndex = 0;

    async *parse(file: FileInput) {
        const file_buffer = await file.slice();
        const file_content = new TextDecoder("utf-8").decode(file_buffer);
        const parsed = parseStringSync(file_content);

        const channelId = this.builder.addChannel(this.channelIndex++, {
            n: "default",
        });

        for (const message of parsed) {
            const timestamp = message.date.getTime();

            if (message.author !== "System") {
                const authorId = this.builder.addAuthor(message.author, {
                    n: message.author,
                    b: false,
                });
                this.builder.addMessage({
                    authorId,
                    channelId,
                    content: message.message,
                    timestamp,
                });
            } else {
                // TODO: parse system messages
            }
        }

        this.builder.setTitle("WhatsApp chat"); // TODO: chat or group
    }
}
