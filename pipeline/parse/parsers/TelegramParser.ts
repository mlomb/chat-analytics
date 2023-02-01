import { AttachmentType, getAttachmentTypeFromMimeType } from "@pipeline/Attachments";
import { Index, RawID } from "@pipeline/Types";
import { FileInput, streamJSONFromFile } from "@pipeline/parse/File";
import { JSONStream } from "@pipeline/parse/JSONStream";
import { Parser } from "@pipeline/parse/Parser";

export class TelegramParser extends Parser {
    private lastChannelName?: string;
    private lastChannelType?: TelegramChannelType;
    private lastChannelID?: RawID;

    async *parse(file: FileInput) {
        const stream = new JSONStream()
            .onObject<string>("name", this.onChannelName.bind(this))
            .onObject<TelegramChannelType>("type", this.onChannelType.bind(this))
            .onObject<RawID>("id", this.onChannelId.bind(this))
            .onArrayItem<TelegramMessage>("messages", this.parseMessage.bind(this));

        yield* streamJSONFromFile(stream, file);

        this.lastChannelName = undefined;
        this.lastChannelID = undefined;
    }

    private onChannelName(channelName: string) {
        this.lastChannelName = channelName;
    }

    private onChannelType(channelType: TelegramChannelType) {
        this.lastChannelType = channelType;
    }

    private onChannelId(rawChannelId: RawID) {
        this.lastChannelID = rawChannelId;

        this.emit("guild", {
            id: 0,
            name: "Telegram Chats",
        });

        this.emit("channel", {
            id: rawChannelId,
            guildId: 0,
            name: this.lastChannelName || "Telegram chat",
            type: ["personal_chat", "bot_chat"].includes(this.lastChannelType || "") ? "dm" : "group",
        });
    }

    private parseMessage(message: TelegramMessage) {
        if (this.lastChannelID === undefined) throw new Error("Missing channel ID");

        const rawId: RawID = message.id + "";
        const rawAuthorId: RawID = message.from_id + "";
        const rawReplyToId: RawID | undefined =
            message.reply_to_message_id === null ? undefined : message.reply_to_message_id + "";

        const timestamp = Date.parse(message.date);
        const timestampEdit = message.edited ? Date.parse(message.edited) : undefined;

        if (message.type === "message") {
            this.emit("author", {
                id: rawAuthorId,
                // use the ID as name if no nickname is available
                name: message.from || rawId,
                // NOTE: I can't find a reliable way to detect if an author is a bot :(
                bot: false,
            });

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

            this.emit("message", {
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
            });
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
