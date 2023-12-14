import { AttachmentType, getAttachmentTypeFromFileName } from "@pipeline/Attachments";
import { Progress } from "@pipeline/Progress";
import { ChannelType } from "@pipeline/Types";
import { FileInput, streamJSONFromFile, tryToFindTimestampAtEnd } from "@pipeline/parse/File";
import { JSONStream } from "@pipeline/parse/JSONStream";
import { Parser } from "@pipeline/parse/Parser";
import { PAuthor, PCall, PChannel, PMessage, RawID } from "@pipeline/parse/Types";

export class DiscordParser extends Parser {
    private lastGuildId?: RawID;
    private lastChannelId?: RawID;
    private lastMessageTimestampInFile?: number;

    /**
     * Regex to find the timestamp of the last message in a Discord export file.
     * We use the timestamp of the last message as the `at` value (see @Parser)
     */
    static readonly TS_MSG_REGEX = /"timestamp": ?"([0-9-:.+T]+)"/gi;

    /**
     * Parse a Discord export file from DCE (https://github.com/Tyrrrz/DiscordChatExporter)
     *
     * We are assuming that in the JSON file, the "guild" key appear first and the "channel" key second in the file.
     * This is up to DCE, hopefully they won't change it.
     * Since we are streaming the file, we can handle big exports 😊
     */
    async *parse(file: FileInput, progress?: Progress) {
        this.lastMessageTimestampInFile = await tryToFindTimestampAtEnd(DiscordParser.TS_MSG_REGEX, file);
        this.lastChannelId = undefined;
        this.lastGuildId = undefined;

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

        this.emit("guild", { id: guild.id, name: guild.name, avatar: iconUrl }, this.lastMessageTimestampInFile);
        this.lastGuildId = guild.id;
    }

    private parseChannel(channel: DiscordChannel) {
        if (this.lastGuildId === undefined) throw new Error("Missing guild ID");

        let type: ChannelType = "text";

        if (channel.type == "DirectTextChat") type = "dm";
        else if (channel.type == "DirectGroupTextChat") type = "group";

        const pchannel: PChannel = {
            id: channel.id,
            guildId: this.lastGuildId,
            name: channel.name,
            type,
            // If the channel is a group:
            //   + the default avatar is the timestamp of the Snowflake mod 8
            //   + image avatars are not available in the export, see https://github.com/Tyrrrz/DiscordChatExporter/issues/987
            // else: we other kind of channels don't have avatars
            avatar: type === "group" ? this.parseSnowflake(channel.id).timestamp.toString() : undefined,
        };

        this.emit("channel", pchannel, this.lastMessageTimestampInFile);
        this.lastChannelId = channel.id;
    }

    private parseMessage(message: DiscordMessage) {
        if (this.lastChannelId === undefined) throw new Error("Missing channel ID");

        // Timestamps in the export are in UTC
        // "YYYY-MM-DDTHH:MM:SS.mmm+00:00"
        const timestamp = Date.parse(message.timestamp);
        const timestampEdit = message.timestampEdited ? Date.parse(message.timestampEdited) : undefined;
        const callEndedTimestamp = message.callEndedTimestamp ? Date.parse(message.callEndedTimestamp) : undefined;

        // Discord allows users to have different nicknames depending on the chat. We honor the nickname first
        let name = message.author.nickname || message.author.name;
        if (name === "Deleted User") {
            name = name.concat(" #" + message.author.id);
        } else if (message.author.discriminator !== "0000") {
            name = name.concat("#" + message.author.discriminator);
        }

        // About the avatar:
        // See: https://discord.com/developers/docs/reference#image-formatting-cdn-endpoints
        // Can be:
        // - https://cdn.discordapp.com/avatars/user_id/user_avatar.png (custom avatar, we only care about `user_id/user_avatar`)
        // - https://cdn.discordapp.com/embed/avatars/discriminator.png (default color avatar)
        let avatar: string | undefined;
        if (message.author.avatarUrl && message.author.avatarUrl.includes("discordapp.com/avatars"))
            avatar = message.author.avatarUrl.slice(35).split(".")[0];

        const pauthor: PAuthor = {
            id: message.author.id,
            bot: message.author.isBot,
            name,
            avatar: avatar ? (" " + avatar).substring(1) : undefined, // avoid leak
        };
        this.emit("author", pauthor, this.lastMessageTimestampInFile);

        if (message.type == "Default" || message.type == "Reply") {
            let content = message.content;
            for (const mention of message.mentions) {
                // replace names by nicknames in mentions (to honor nicknames)
                // and just to make sure, replace spaces by underscores in the nickname and
                // add spaces in the sides so that it can be picked correctly up by the Tokenizer
                content = content.split(`@${mention.name}`).join(` @${mention.nickname.replace(/\s/g, "_")} `);
            }

            // stickers may be undefined if the export was before stickers were added to DCE
            // TODO: in the far future we may want to make stats for platforms that support stickers (in their exports)
            const stickers = message.stickers || [];

            const pmessage: PMessage = {
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
                reactions: message.reactions.map((r) => {
                    const emojiId = r.emoji.id === null || r.emoji.id === "" ? undefined : r.emoji.id;
                    return [
                        {
                            id: emojiId,
                            text: r.emoji.name || emojiId || "unknown",
                        },
                        r.count,
                    ];
                }),
            };
            this.emit("message", pmessage, this.lastMessageTimestampInFile);
        } else if (message.type === "Call") {
            if (callEndedTimestamp === undefined) {
                console.warn("Call message without callEndedTimestamp");
                // we don't want to throw here
                // discord may have gone crazy or the export was done while in call
                return;
            }

            const pcall: PCall = {
                id: message.id,
                authorId: message.author.id,
                channelId: this.lastChannelId,
                timestampStart: timestamp,
                timestampEnd: callEndedTimestamp,
            };

            this.emit("call", pcall, this.lastMessageTimestampInFile);
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
