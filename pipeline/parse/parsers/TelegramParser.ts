import { AttachmentType, getAttachmentTypeFromMimeType } from "@pipeline/Attachments";
import { Progress } from "@pipeline/Progress";
import { Timestamp } from "@pipeline/Types";
import { FileInput, streamJSONFromFile, tryToFindTimestampAtEnd } from "@pipeline/parse/File";
import { JSONStream } from "@pipeline/parse/JSONStream";
import { Parser } from "@pipeline/parse/Parser";
import { PAuthor, PCall, PChannel, PGuild, PMessage, RawID } from "@pipeline/parse/Types";

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
     * This pattern matches messages nested anywhere in the JSON structure.
     */
    static readonly TS_MSG_REGEX = /"date(?:_unixtime)?": ?"(.+?)"/gi;

    async *parse(file: FileInput, progress?: Progress) {
        this.lastMessageTimestampInFile = await tryToFindTimestampAtEnd(TelegramParser.TS_MSG_REGEX, file);

        // Detect format by reading the beginning of the file
        const isMultiChatExport = await this.detectMultiChatFormat(file);

        if (isMultiChatExport) {
            yield* this.parseMultiChatExport(file, progress);
        } else {
            yield* this.parseSingleChatExport(file, progress);
        }

        // Reset state
        this.lastChannelName = undefined;
        this.lastChannelID = undefined;
        this.lastEmittedMessageTimestamp = undefined;
    }

    /**
     * Detect if this is a multi-chat export by examining the structure.
     * Multi-chat exports have: { chats: { list: [...] } }
     * Single-chat exports have: { name, type, id, messages: [...] }
     */
    private async detectMultiChatFormat(file: FileInput): Promise<boolean> {
        try {
            // Read first 2MB to detect format without loading the entire file
            const sampleSize = Math.min(2097152, file.size || 2097152);
            const buffer = await file.slice(0, sampleSize);
            const text = new TextDecoder('utf-8').decode(buffer);
            
            // Simple check: if the file contains "chats" key and "list" key in the root level,
            // it's likely a multi-chat export. Single-chat exports have "name", "type", "id", "messages".
            const hasChatsKey = text.includes('"chats"');
            const hasListKey = text.includes('"list"');
            const hasNameKey = text.includes('"name"');
            const hasMessagesKey = text.includes('"messages"');
            
            // If it has chats and list but is early in the file, it's multi-chat
            // If it has name and messages early, it's single-chat
            if (hasChatsKey && hasListKey) {
                return true;
            } else if (hasNameKey && hasMessagesKey) {
                return false;
            } else {
                return false;
            }
        } catch (err) {
            // If detection fails, assume single-chat format for backward compatibility
            return false;
        }
    }

    /**
     * Parse a single-chat export format: { name, type, id, messages: [...] }
     */
    private async *parseSingleChatExport(file: FileInput, progress?: Progress) {
        const stream = new JSONStream()
            .onObject<string>("name", this.onChannelName.bind(this))
            .onObject<TelegramChannelType>("type", this.onChannelType.bind(this))
            .onObject<RawID>("id", this.onChannelId.bind(this))
            .onArrayItem<TelegramMessage>("messages", this.parseMessage.bind(this));

        yield* streamJSONFromFile(stream, file, progress);
    }

    /**
     * Parse a multi-chat export format: { chats: { list: [TelegramChat, ...] } }
     */
    private async *parseMultiChatExport(file: FileInput, progress?: Progress) {
        const stream = new JSONStream()
            .onObject<TelegramChatsContainer>("chats", this.parseChatsContainer.bind(this));

        yield* streamJSONFromFile(stream, file, progress);
    }

    /**
     * Parse the chats container object from multi-chat exports.
     */
    private parseChatsContainer(chatsContainer: TelegramChatsContainer) {
        for (const chat of chatsContainer.list) {
            this.parseChatObject(chat);
        }
    }

    /**
     * Parse a single chat object. Used by both single-chat and multi-chat formats.
     * Resets state variables to avoid cross-chat contamination.
     */
    private parseChatObject(chat: TelegramChat) {
        // Reset state for this chat
        this.lastChannelName = undefined;
        this.lastChannelType = undefined;
        this.lastChannelID = undefined;
        this.lastEmittedMessageTimestamp = undefined;
        
        // Set chat metadata
        this.lastChannelName = chat.name;
        this.lastChannelType = chat.type;
        this.lastChannelID = chat.id;

        // Emit guild and channel
        const pguild: PGuild = {
            id: 0,
            name: "Telegram Chats",
        };
        const pchannel: PChannel = {
            id: chat.id,
            guildId: 0,
            name: chat.name || "Telegram chat",
            type: ["personal_chat", "bot_chat"].includes(chat.type || "") ? "dm" : "group",
        };

        this.emit("guild", pguild, this.lastMessageTimestampInFile);
        this.emit("channel", pchannel, this.lastMessageTimestampInFile);

        // Process all messages in this chat
        for (const message of chat.messages) {
            this.parseMessage(message);
        }
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
        const rawAuthorId: RawID = (message.from_id || message.actor_id) + "";
        const rawReplyToId: RawID | undefined = message.reply_to_message_id
            ? message.reply_to_message_id + ""
            : undefined;

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
        } else if (message.type === "service" && message.action === "phone_call") {
            const pcall: PCall = {
                id: rawId,
                authorId: rawAuthorId,
                channelId: this.lastChannelID,
                timestampStart: timestamp,
                timestampEnd: timestamp + (message.duration_seconds || 0) * 1000,
            };

            this.emit("call", pcall);
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
