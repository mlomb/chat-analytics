import { AttachmentType, getAttachmentTypeFromMimeType } from "@pipeline/Attachments";
import { Progress } from "@pipeline/Progress";
import { Timestamp } from "@pipeline/Types";
import { FileInput, streamJSONFromFile, tryToFindTimestampAtEnd } from "@pipeline/parse/File";
import { JSONStream } from "@pipeline/parse/JSONStream";
import { Parser } from "@pipeline/parse/Parser";
import { PAuthor, PChannel, PGuild, PMessage, RawID } from "@pipeline/parse/Types";

export class TelegramParser extends Parser {
    private lastChannelName?: string;
    private lastChannelType?: TelegramChannelType;
    private lastChannelID?: RawID;
    private lastMessageTimestampInFile?: Timestamp;
    /** Used to detect DST */
    private lastEmittedMessageTimestamp?: Timestamp;

    /**
     * Regex to find the timestamp of the last message in a Telegram export file.
     * We use the timestamp of the last message as the `at` value (see @Parser)
     */
    static readonly TS_MSG_REGEX = /"date(?:_unixtime)?": ?"(.+?)"/gi;

    async *parse(file: FileInput, progress?: Progress) {
        this.lastMessageTimestampInFile = await tryToFindTimestampAtEnd(TelegramParser.TS_MSG_REGEX, file);

        const stream = new JSONStream()
            .onObject<string>("name", this.onChannelName.bind(this))
            .onObject<TelegramChannelType>("type", this.onChannelType.bind(this))
            .onObject<RawID>("id", this.onChannelId.bind(this))
            .onArrayItem<TelegramMessage>("messages", this.parseMessage.bind(this));

        yield* streamJSONFromFile(stream, file, progress);

        this.lastChannelName = undefined;
        this.lastChannelID = undefined;
        this.lastEmittedMessageTimestamp = undefined;
    }

    private onChannelName(channelName: string) {
        this.lastChannelName = channelName;
    }

    private onChannelType(channelType: TelegramChannelType) {
        this.lastChannelType = channelType;
    }

    private onChannelId(rawChannelId: RawID) {
        this.lastChannelID = rawChannelId;

        const pguild: PGuild = {
            id: 0,
            name: "Telegram Chats",
        };
        const pchannel: PChannel = {
            id: rawChannelId,
            guildId: 0,
            name: this.lastChannelName || "Telegram chat",
            type: ["personal_chat", "bot_chat"].includes(this.lastChannelType || "") ? "dm" : "group",
        };

        this.emit("guild", pguild, this.lastMessageTimestampInFile);
        this.emit("channel", pchannel, this.lastMessageTimestampInFile);
    }

    private parseMessage(message: TelegramMessage) {
        if (this.lastChannelID === undefined) throw new Error("Missing channel ID");

        const rawId: RawID = message.id + "";
        const rawAuthorId: RawID = message.from_id + "";
        const rawReplyToId: RawID | undefined =
            message.reply_to_message_id === null ? undefined : message.reply_to_message_id + "";

        // read from unix timestamp or full datetime
        const timestamp = message.date_unixtime ? parseInt(message.date_unixtime) * 1000 : Date.parse(message.date!);
        const timestampEdit = message.edited_unixtime
            ? parseInt(message.edited_unixtime) * 1000
            : message.edited
            ? Date.parse(message.edited)
            : undefined;

        if (message.type === "message") {
            const pauthor: PAuthor = {
                id: rawAuthorId,
                // use the ID as name if no nickname is available
                name: message.from || rawId,
                // NOTE: I can't find a reliable way to detect if an author is a bot :(
                bot: false,
            };
            this.emit("author", pauthor, this.lastMessageTimestampInFile);

            let textContent = this.parseTextArray(message.text);
            let attachment: AttachmentType | undefined;

            // determinate attachment type
            if (message.media_type === "sticker") attachment = AttachmentType.Sticker;
            if (message.mime_type) attachment = getAttachmentTypeFromMimeType(message.mime_type);
            if (message.location_information !== undefined) attachment = AttachmentType.Other;

            if (textContent.length === 0 && attachment === undefined) {
                // sometimes messages do not include the "mime_type" but "photo"
                if (message.photo) attachment = AttachmentType.Image;
                // polls
                if (message.poll) {
                    // put the question as the message content
                    textContent = message.poll.question;
                }
                // NOTE: also :dart: emoji appears as empty content
            }

            const pmessage: PMessage = {
                id: rawId,
                replyTo: rawReplyToId,
                authorId: rawAuthorId,
                channelId: this.lastChannelID,
                timestamp,
                timestampEdit,
                textContent,
                attachments: attachment === undefined ? [] : [attachment],
                // NOTE: as of now, Telegram doesn't export reactions :(
                // reactions: [],
            };

            // before emitting, check if it's out of order
            if (this.lastEmittedMessageTimestamp !== undefined && timestamp < this.lastEmittedMessageTimestamp) {
                // we assume DST
                this.emit("out-of-order");
            }

            this.emit("message", pmessage, this.lastMessageTimestampInFile);
            this.lastEmittedMessageTimestamp = timestamp;
        }
    }

    private parseTextArray(input: string | TextArray | TextArray[]): string {
        if (typeof input === "string") return input;
        if (Array.isArray(input)) return input.map(this.parseTextArray.bind(this)).join("");
        switch (input.type) {
            // remove slash and split potential @
            // examples:
            // /command → command
            // /command@bot → command @bot
            case "bot_command":
                return input.text.replace("/", "").replace("@", " @");

            // remove #
            case "hashtag":
                return input.text.replace("#", "");

            // add redundant spaces to the sides to make sure it will be tokenized correctly
            case "link":
            case "mention":
            case "text_link":
                return ` ${input.text} `;

            // emails are removed
            case "email":
                return "";

            // by default just return the text
            default:
                return input.text;
        }
    }
}
