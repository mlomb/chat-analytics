import { IAuthor, Index } from "@pipeline/Types";
import { Parser } from "@pipeline/parse/Parser";

import { JSONStream } from "@pipeline/parse/JSONStream";
import { FileInput, getAttachmentTypeFromFileName, streamJSONFromFile } from "@pipeline/File";

export class DiscordParser extends Parser {
    private channelIndex?: Index;

    async *parse(file: FileInput) {
        const stream = new JSONStream();

        stream.onObject<DiscordGuild>("guild", (guild) => this.builder.setTitle(guild.name));
        stream.onObject<DiscordChannel>("channel", this.parseChannel.bind(this));
        stream.onArrayItem<DiscordMessage>("messages", this.parseMessage.bind(this));

        yield* streamJSONFromFile(stream, file);

        this.channelIndex = undefined;
    }

    private parseChannel(channel: DiscordChannel) {
        this.channelIndex = this.builder.addChannel(channel.id, { n: channel.name });
    }

    private parseMessage(message: DiscordMessage) {
        if (this.channelIndex === undefined) throw new Error("Missing channel ID");

        const timestamp = Date.parse(message.timestamp);
        const timestampEdit = message.timestampEdited ? Date.parse(message.timestampEdited) : undefined;

        const author: IAuthor = {
            n: message.author.nickname,
            d: parseInt(message.author.discriminator),
        };
        if (message.author.isBot) author.b = true;

        // See: https://discord.com/developers/docs/reference#image-formatting-cdn-endpoints
        // Can be:
        // - https://cdn.discordapp.com/avatars/user_id/user_avatar.png
        // - https://cdn.discordapp.com/embed/avatars/discriminator.png (must not set avatar, length is < 50)
        if (message.author.avatarUrl && message.author.avatarUrl.length > 50) {
            const avatar = message.author.avatarUrl.slice(35).split(".")[0];
            author.da = (" " + avatar).substring(1); // avoid leak
        }

        // :)
        if (message.type == "Default" || message.type == "Reply") {
            const authorIndex = this.builder.addAuthor(message.author.id, author);

            let content = message.content;
            for (const mention of message.mentions) {
                // replace names by nicknames in mentions
                // and just to make sure, replace spaces by underscores in the nickname
                // and add spaces in the sides
                content = content.split(`@${mention.name}`).join(` @${mention.nickname.replace(/\s/g, "_")} `);
            }

            // NOTE: stickers right now are messages with empty content
            //       see https://github.com/Tyrrrz/DiscordChatExporter/issues/638

            this.builder.addMessage({
                id: message.id,
                replyTo: message.reference?.messageId,
                authorIndex,
                channelIndex: this.channelIndex,
                timestamp,
                timestampEdit,
                content: content.length > 0 ? content : undefined,
                attachments: message.attachments.map((a) => getAttachmentTypeFromFileName(a.fileName)),
                reactions: message.reactions.map((r) => [
                    {
                        n: r.emoji.name || r.emoji.id || "unknown",
                        id: r.emoji.id === null ? undefined : r.emoji.id,
                    },
                    r.count,
                ]),
            });
        } else if (message.type == "ChannelPinnedMessage") {
        } else if (message.type == "GuildMemberJoin") {
        } else {
            // "8", "9", "20" ?
            // console.warn("Unhandled message type", message.type, message);
        }
    }
}
