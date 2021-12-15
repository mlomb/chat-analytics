import { FileInput } from "@pipeline/Types";
import { Parser } from "@pipeline/parse/Parser";
import { Author } from "@pipeline/parse/Database";
import JSONStream from "@pipeline/parse/JSONStream";

import { DiscordChannel, DiscordGuild, DiscordMessage, Snowflake } from "@pipeline/parse/DiscordParser.d";

export class DiscordParser extends Parser {
    private channelId?: Snowflake;

    constructor() {
        super("discord");
    }

    async *parse(file: FileInput) {
        const stream = new JSONStream(file);

        stream.onFull<DiscordGuild>("guild", (guild) => this.updateTitle(guild.name));
        stream.onFull<DiscordChannel>("channel", this.parseChannel.bind(this));
        stream.onArray<DiscordMessage>("messages", this.parseMessage.bind(this));

        yield* stream.parse();

        this.channelId = undefined;
    }

    private parseChannel(channel: DiscordChannel) {
        this.channelId = channel.id;
        this.addChannel({ id: channel.id, name: channel.name });
    }

    private parseMessage(message: DiscordMessage) {
        if (this.channelId === undefined) throw new Error("Missing channel ID");

        const timestamp = Date.parse(message.timestamp);

        if (!this.database.authors.has(message.author.id)) {
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
            this.addAuthor(author);
        }

        if (message.type == "Default") {
            this.addMessage({
                id: message.id,
                channelId: this.channelId,
                authorId: message.author.id,
                timestamp,
                content: message.content,
            });
        } else {
            //console.warn("Unhandled message type", message.type);
        }
    }
}
