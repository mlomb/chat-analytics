import { Parser } from "@pipeline/parse/Parser";

/*
    There is a convenient parser already out there
*/
import { parseStringSync } from "whatsapp-chat-parser";

export class WhatsAppParser extends Parser {
    private channelId = 0;
    private messageId = 0;

    constructor() {
        super("whatsapp");
    }

    parse(file_content: string) {
        const parsed = parseStringSync(file_content);

        const channel = this.addChannel(
            {
                id: this.channelId++ + "",
                name: "default",
            },
            0
        );

        for (const message of parsed) {
            const timestamp = message.date.getTime();

            if (message.author !== "System") {
                this.addAuthor(
                    {
                        id: message.author,
                        name: message.author,
                        bot: false,
                    },
                    timestamp
                );
                this.addMessage({
                    id: this.messageId++ + "",
                    authorId: message.author,
                    channelId: channel.id,
                    content: message.message,
                    timestamp,
                });
            } else {
                // TODO: parse system messages
            }
        }

        this.updateTitle("WhatsApp chat", 0); // TODO: chat or group
    }
}
