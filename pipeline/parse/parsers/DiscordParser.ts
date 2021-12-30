import { IAuthor, ID } from "@pipeline/Types";
import { Parser } from "@pipeline/parse/Parser";

import { JSONStream } from "@pipeline/parse/JSONStream";
import { FileInput, streamJSONFromFile } from "@pipeline/File";

export class DiscordParser extends Parser {
    private channelId?: ID;

    async *parse(file: FileInput) {
        const stream = new JSONStream();

        stream.onObject<DiscordGuild>("guild", (guild) => this.builder.setTitle(guild.name));
        stream.onObject<DiscordChannel>("channel", this.parseChannel.bind(this));
        stream.onArrayItem<DiscordMessage>("messages", this.parseMessage.bind(this));

        yield* streamJSONFromFile(stream, file);

        this.channelId = undefined;
    }

    private parseChannel(channel: DiscordChannel) {
        this.channelId = this.builder.addChannel(channel.id, { n: channel.name });
    }

    private parseMessage(message: DiscordMessage) {
        if (this.channelId === undefined) throw new Error("Missing channel ID");

        const timestamp = Date.parse(message.timestamp);

        const author: IAuthor = {
            n: message.author.nickname,
            b: message.author.isBot,
            d: parseInt(message.author.discriminator),
        };

        // See: https://discord.com/developers/docs/reference#image-formatting-cdn-endpoints
        // Can be:
        // - https://cdn.discordapp.com/avatars/user_id/user_avatar.png
        // - https://cdn.discordapp.com/embed/avatars/discriminator.png (must not set avatar, length is < 50)
        if (message.author.avatarUrl && message.author.avatarUrl.length > 50) {
            const avatar = message.author.avatarUrl.slice(35).split(".")[0];
            author.da = (" " + avatar).substring(1); // avoid leak
        }

        const authorId = this.builder.addAuthor(message.author.id, author);

        // :)
        if (message.type == "Default") {
            this.builder.addMessage({
                authorId,
                channelId: this.channelId,
                timestamp,
                content: message.content,
            });
        } else if (message.type == "Reply") {
        } else if (message.type == "ChannelPinnedMessage") {
        } else {
            console.warn("Unhandled message type", message.type, message);
        }
    }
}
