import { FileInput, ID } from "@pipeline/Types";
import { Parser } from "@pipeline/parse/Parser";
import { Author } from "@pipeline/parse/Database";
import { DiscordChannel, DiscordGuild, DiscordMessage } from "@pipeline/parse/DiscordParser.d";

import { streamJSONFromFile } from "@pipeline/Utils";
import JSONStream from "@pipeline/shared/JSONStream";

export class DiscordParser extends Parser {
    private channelId?: ID;

    constructor() {
        super("discord");
    }

    async *parse(file: FileInput) {
        const stream = new JSONStream();

        stream.onFull<DiscordGuild>("guild", (guild) => this.updateTitle(guild.name));
        stream.onFull<DiscordChannel>("channel", this.parseChannel.bind(this));
        stream.onArray<DiscordMessage>("messages", this.parseMessage.bind(this));

        yield* streamJSONFromFile(stream, file);

        this.channelId = undefined;
    }

    private parseChannel(channel: DiscordChannel) {
        this.channelId = this.addChannel(channel.id, { name: channel.name });
    }

    private parseMessage(message: DiscordMessage) {
        if (this.channelId === undefined) throw new Error("Missing channel ID");

        const timestamp = Date.parse(message.timestamp);

        const author: Author = {
            name: message.author.nickname,
            bot: message.author.isBot,
            discord: {
                discriminator: parseInt(message.author.discriminator),
            },
        };

        // See: https://discord.com/developers/docs/reference#image-formatting-cdn-endpoints
        // Reference: https://cdn.discordapp.com/avatars/user_id/user_avatar.png
        // "https://cdn.discordapp.com/avatars/".length === 35
        if (message.author.avatarUrl && message.author.avatarUrl.length > 35) {
            author.discord!.avatar = message.author.avatarUrl.slice(35).split(".")[0];
        }

        // store author
        const authorId = this.addAuthor(message.author.id, author);

        if (message.type == "Default") {
            this.addMessage(message.id, this.channelId, {
                authorId,
                timestamp,
                content: message.content,
            });
        } else {
            //console.warn("Unhandled message type", message.type);
        }
    }
}
