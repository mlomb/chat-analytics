import { AttachmentType, getAttachmentTypeFromFileName } from "@pipeline/Attachments";
import { Progress } from "@pipeline/Progress";
import { ChannelType } from "@pipeline/Types";
import { FileInput, streamJSONFromFile } from "@pipeline/parse/File";
import { JSONStream } from "@pipeline/parse/JSONStream";
import { Parser } from "@pipeline/parse/Parser";
import { RawID } from "@pipeline/parse/Types";

export class DiscordParser extends Parser {
    private lastGuildId?: RawID;
    private lastChannelId?: RawID;

    /**
     * Parse a Discord export file from DCE (https://github.com/Tyrrrz/DiscordChatExporter)
     *
     * We are assuming that in the JSON file, the "guild" key appear first and the "channel" key second in the file.
     * This is up to DCE, hopefully they won't change it.
     * Since we are streaming the file, we can handle big exports 😊
     */
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
            // this is the default icon, we treat is as having no icon at all
            iconUrl = undefined;
        }

        this.emit("guild", { id: guild.id, name: guild.name, avatar: iconUrl });
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
            // If the channel is a group:
            //   + the default avatar is the timestamp of the Snowflake mod 8
            //   + image avatars are not available in the export, see https://github.com/Tyrrrz/DiscordChatExporter/issues/987
            // else: we other kind of channels don't have avatars
            avatar: type === "group" ? this.parseSnowflake(channel.id).timestamp.toString() : undefined,
        });
        this.lastChannelId = channel.id;
    }

    private parseMessage(message: DiscordMessage) {
        if (this.lastChannelId === undefined) throw new Error("Missing channel ID");

        // Timestamps in the export are in UTC
        // "YYYY-MM-DDTHH:MM:SS.mmm+00:00"
        const timestamp = Date.parse(message.timestamp);
        const timestampEdit = message.timestampEdited ? Date.parse(message.timestampEdited) : undefined;

        // Discord allows users to have different nicknames depending the chat. We honor the nickname first
        const name = message.author.nickname || message.author.name;
        const isDeletedUser = name === "Deleted User";

        // About the avatar:
        // See: https://discord.com/developers/docs/reference#image-formatting-cdn-endpoints
        // Can be:
        // - https://cdn.discordapp.com/avatars/user_id/user_avatar.png (custom avatar, we only care about `user_id/user_avatar`)
        // - https://cdn.discordapp.com/embed/avatars/discriminator.png (default color avatar)
        let avatar: string | undefined;
        if (message.author.avatarUrl && message.author.avatarUrl.includes("discordapp.com/avatars"))
            avatar = message.author.avatarUrl.slice(35).split(".")[0];

        this.emit("author", {
            id: message.author.id,
            bot: message.author.isBot,
            name: name + (isDeletedUser ? " #" + message.author.id : "#" + message.author.discriminator),
            avatar: avatar ? (" " + avatar).substring(1) : undefined, // avoid leak
        });

        if (message.type == "Default" || message.type == "Reply") {
            let content = message.content;
            for (const mention of message.mentions) {
                // replace names by nicknames in mentions (to honor nicknames)
                // and just to make sure, replace spaces by underscores in the nickname and
                // add spaces in the sides so it can be picked correctly up by the Tokenizer
                content = content.split(`@${mention.name}`).join(` @${mention.nickname.replace(/\s/g, "_")} `);
            }

            // stickers may be undefined if the export was before stickers were added to DCE
            // TODO: in the far future we may want to make stats for platforms that support stickers (in their exports)
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

    /**
     * Parse a Discord Snowflake into its components
     *
     * See https://discord.com/developers/docs/reference#snowflakes
     */
    parseSnowflake(snowflake: Snowflake) {
        return {
            timestamp: BigInt(snowflake) >> BigInt(22),
            // complete when needed:
            // internalWorkerId
            // internalProcessId
            // increment
        };
    }
}
