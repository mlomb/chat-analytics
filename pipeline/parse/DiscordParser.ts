import { DiscordExportFile } from "@pipeline/parse/DiscordParser.d";
import { Parser } from "@pipeline/parse/Parser";
import { Author } from "@pipeline/parse/Database";

export class DiscordParser extends Parser {
    constructor() {
        super("discord");
    }

    parse(file_content: string): void {
        const data = JSON.parse(file_content) as DiscordExportFile;

        // store channel
        const lastMessageTimestamp =
            data.messages.length > 0 ? Date.parse(data.messages[data.messages.length - 1].timestamp) : 0;
        const channel = this.addChannel(
            {
                id: data.channel.id,
                name: data.channel.name,
            },
            lastMessageTimestamp
        );

        for (const message of data.messages) {
            const timestamp = Date.parse(message.timestamp);

            let author: Author = {
                id: message.author.id,
                name: message.author.nickname,
                bot: message.author.isBot,
                discord: {
                    // @ts-ignore (modulo)
                    discriminator: parseInt(message.author.discriminator) % 5,
                },
            };
            if (message.author.avatarUrl) {
                // TODO: make sure size is 32px
                author.avatarUrl = message.author.avatarUrl;
            }
            if (message.author.color) {
                author.color = message.author.color;
            }

            // store author
            author = this.addAuthor(author, timestamp);

            // store message
            if (message.type == "Default") {
                this.addMessage({
                    id: message.id,
                    channelId: channel.id,
                    authorId: author.id,
                    timestamp,
                    content: message.content,
                });
            } else {
                //console.warn("Unhandled message type", message.type);
            }
        }

        this.updateTitle(data.guild.name, lastMessageTimestamp);
    }
}
