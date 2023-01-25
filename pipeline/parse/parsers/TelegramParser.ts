// @ts-nocheck
import { FileInput, getAttachmentTypeFromMimeType, streamJSONFromFile } from "@pipeline/File";
import { AttachmentType, Index, RawID } from "@pipeline/Types";
import { JSONStream } from "@pipeline/parse/JSONStream";
import { Parser } from "@pipeline/parse/Parser";

export class TelegramParser extends Parser {
    private lastChannelName?: string;
    private lastChannelType?: TelegramChannelType;
    private lastChannelIndex?: Index;

    async *parse(file: FileInput) {
        const stream = new JSONStream()
            .onObject<string>("name", this.onChannelName.bind(this))
            .onObject<TelegramChannelType>("type", this.onChannelType.bind(this))
            .onObject<RawID>("id", this.onChannelId.bind(this))
            .onArrayItem<TelegramMessage>("messages", this.parseMessage.bind(this));

        yield* streamJSONFromFile(stream, file);

        this.lastChannelName = undefined;
        this.lastChannelIndex = undefined;
    }

    private onChannelName(channelName: string) {
        this.lastChannelName = channelName;
    }

    private onChannelType(channelType: TelegramChannelType) {
        this.lastChannelType = channelType;
    }

    private onChannelId(rawChannelId: RawID) {
        const guildIndex = this.builder.addGuild("Default", {
            name: "Telegram Chats",
        });

        this.lastChannelIndex = this.builder.addChannel(rawChannelId, {
            name: this.lastChannelName || "Telegram chat",
            guildIndex,
            type: ["personal_chat", "bot_chat"].includes(this.lastChannelType || "") ? "dm" : "group",
        });
    }

    private parseMessage(message: TelegramMessage) {
        if (this.lastChannelIndex === undefined) throw new Error("Missing channel ID");

        const rawId: RawID = message.id + "";
        const rawAuthorId: RawID = message.from_id + "";
        const rawReplyToId: RawID | undefined =
            message.reply_to_message_id === null ? undefined : message.reply_to_message_id + "";

        const timestamp = Date.parse(message.date);
        const timestampEdit = message.edited ? Date.parse(message.edited) : undefined;

        if (message.type === "message") {
            // NOTE: I can't find a reliable way to detect if a user is a bot :(
            const authorIndex = this.builder.addAuthor(rawAuthorId, {
                // use the ID as name if no nickname is available
                n: message.from || rawId,
            });

            let content = this.parseTextArray(message.text);
            let attachment: AttachmentType | undefined;

            // determinate attachment type
            if (message.media_type === "sticker") attachment = AttachmentType.Sticker;
            if (message.mime_type) attachment = getAttachmentTypeFromMimeType(message.mime_type);
            if (message.location_information !== undefined) attachment = AttachmentType.Other;

            if (content.length === 0 && attachment === undefined) {
                // sometimes messages do not include the "mime_type" but "photo"
                if (message.photo) attachment = AttachmentType.Image;
                // polls
                if (message.poll) {
                    // put the question as the message content
                    content = message.poll.question;
                }
                // NOTE: also :dart: emoji appears as empty content
            }

            this.builder.addMessage({
                id: rawId,
                replyTo: rawReplyToId,
                authorIndex,
                channelIndex: this.lastChannelIndex,
                timestamp,
                timestampEdit,
                content,
                attachments: attachment === undefined ? [] : [attachment],
                // NOTE: as of now, Telegram doesn't export reactions :(
                reactions: [],
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
