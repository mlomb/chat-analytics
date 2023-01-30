import { AttachmentType, getAttachmentTypeFromFileName } from "@pipeline/Attachments";
import { Progress } from "@pipeline/Progress";
import { ChannelType, RawID } from "@pipeline/Types";
import { FileInput, streamJSONFromFile } from "@pipeline/parse/File";
import { JSONStream } from "@pipeline/parse/JSONStream";
import { Parser } from "@pipeline/parse/Parser";
import { PAuthor } from "@pipeline/parse/Types";

export class DiscordParser extends Parser {
    private lastGuildId?: RawID;
    private lastChannelId?: RawID;

    async *parse(file: FileInput, progress?: Progress) {
        const stream = new JSONStream()
            .onObject<DiscordGuild>("guild", this.parseGuild.bind(this))
            .onObject<DiscordChannel>("channel", this.parseChannel.bind(this))
            .onArrayItem<DiscordMessage>("messages", this.parseMessage.bind(this));

        yield* streamJSONFromFile(stream, file, progress);
    }

    private parseGuild(guild: DiscordGuild) {
        let iconUrl: string | undefined = guild.iconUrl;

        if (iconUrl === "https://cdn.discordapp.com/embed/avatars/0.png") {
            // default icon means no icon
            // I think this is DCE's fault but I'm not sure
            iconUrl = undefined;
        }

        this.emit("guild", { id: guild.id, name: guild.name, iconUrl });
        this.lastGuildId = guild.id;
    }

    private parseChannel(channel: DiscordChannel) {
        if (this.lastGuildId === undefined) throw new Error("Missing guild ID");

        let type: ChannelType = "text";

        if (channel.type == "DirectTextChat") type = "dm";
        else if (channel.type == "DirectGroupTextChat") type = "group";

        this.emit("channel", {
            id: channel.id,
            guildId: this.lastGuildId,
            name: channel.name,
            type,
            avatar: this.parseSnowflake(channel.id).timestamp.toString(),
        });
        this.lastChannelId = channel.id;
    }

    private parseMessage(message: DiscordMessage) {
        if (this.lastChannelId === undefined) throw new Error("Missing channel ID");

        const timestamp = Date.parse(message.timestamp);
        const timestampEdit = message.timestampEdited ? Date.parse(message.timestampEdited) : undefined;

        const name = message.author.nickname || message.author.name;
        const isDeletedUser = message.author.nickname == "Deleted User";
        const author: PAuthor = {
            id: message.author.id,
            name: name + (isDeletedUser ? " #" + message.author.id : "#" + message.author.discriminator),
            bot: false,
        };
        if (message.author.isBot) author.bot = true;

        // See: https://discord.com/developers/docs/reference#image-formatting-cdn-endpoints
        // Can be:
        // - https://cdn.discordapp.com/avatars/user_id/user_avatar.png
        // - https://cdn.discordapp.com/embed/avatars/discriminator.png (must not set avatar, length is < 50)
        const hasAvatar = message.author.avatarUrl && message.author.avatarUrl.length > 50;
        if (hasAvatar) {
            const avatar = message.author.avatarUrl.slice(35).split(".")[0];
            author.avatar = (" " + avatar).substring(1); // avoid leak
        }

        // :)
        if (message.type == "Default" || message.type == "Reply") {
            this.emit("author", author);

            let content = message.content;
            for (const mention of message.mentions) {
                // replace names by nicknames in mentions
                // and just to make sure, replace spaces by underscores in the nickname
                // and add spaces in the sides
                content = content.split(`@${mention.name}`).join(` @${mention.nickname.replace(/\s/g, "_")} `);
            }

            // stickers may be undefined if the export was before stickers were added to DCE
            const stickers = message.stickers || [];

            this.emit("message", {
                id: message.id,
                authorId: message.author.id,
                channelId: this.lastChannelId,
                timestamp,
                timestampEdit,
                replyTo: message.reference?.messageId,

                textContent: content.length > 0 ? content : undefined,
                attachments: message.attachments
                    .map((a) => getAttachmentTypeFromFileName(a.fileName))
                    .concat(stickers.map((_) => AttachmentType.Sticker)),
                reactions: message.reactions.map((r) => [
                    {
                        id: r.emoji.id === null ? undefined : r.emoji.id,
                        name: r.emoji.name || r.emoji.id || "unknown",
                    },
                    r.count,
                ]),
            });
        }
    }

    // See https://discord.com/developers/docs/reference#snowflakes
    parseSnowflake(snowflake: string) {
        return {
            timestamp: BigInt(snowflake) >> BigInt(22),
            // internalWorkerId
            // internalProcessId
            // increment
        };
    }
}
