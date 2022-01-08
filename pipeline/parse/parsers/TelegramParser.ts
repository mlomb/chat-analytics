import { ID, RawID } from "@pipeline/Types";
import { Parser } from "@pipeline/parse/Parser";

import { JSONStream } from "@pipeline/parse/JSONStream";
import { FileInput, streamJSONFromFile } from "@pipeline/File";

export class TelegramParser extends Parser {
    private channelName?: string;
    private channelId?: ID;

    async *parse(file: FileInput) {
        const stream = new JSONStream();

        stream.onObject<string>("name", this.onChannelName.bind(this));
        stream.onObject<string>("id", this.onChannelId.bind(this));
        stream.onArrayItem<TelegramMessage>("messages", this.parseMessage.bind(this));

        yield* streamJSONFromFile(stream, file);

        this.channelName = undefined;
        this.channelId = undefined;
    }

    private onChannelName(channelName: string) {
        this.channelName = channelName;
        this.builder.setTitle(channelName);
    }

    private onChannelId(rawChannelId: string) {
        this.channelId = this.builder.addChannel(rawChannelId, { n: this.channelName || "default" });
    }

    private parseMessage(message: TelegramMessage) {
        if (this.channelId === undefined) throw new Error("Missing channel ID");

        const rawId: RawID = message.id + "";
        const rawAuthorId: RawID = message.from_id + "";
        const timestamp = Date.parse(message.date);
        const timestampEdit = message.edited ? Date.parse(message.edited) : undefined;

        // NOTE: I can't find a reliable way to detect if a user is a bot :(
        const authorId = this.builder.addAuthor(rawAuthorId, {
            // use the ID as name if no nickname is available
            n: message.from || rawId,
        });

        if (message.type === "message") {
            let content = this.parseTextArray(message.text);

            // append sticker_emoji as a normal emoji
            if (message.sticker_emoji) {
                if (content.length === 0) content = message.sticker_emoji;
                else content += ` ${message.sticker_emoji}`;
            }

            // read mime_type
            if (message.mime_type) {
                // examples:
                // application/pdf
                // application/zip
                // audio/mp3
                // audio/mpeg
                // audio/ogg
                // image/gif
                // image/jpeg
                // image/png
                // text/plain
                // video/mp4
                // video/webm
                // ... lots more
            }

            this.builder.addMessage({
                id: rawId,
                replyTo: message.reply_to_message_id ? message.reply_to_message_id + "" : undefined,
                authorId,
                channelId: this.channelId,
                timestamp,
                timestampEdit,
                content,
                attachments: [],
                // NOTE: as of now, Telegram doesn't export reactions
                reactions: [],
            });
        }
    }

    private parseTextArray(input: string | TextArray | TextArray[]): string {
        if (typeof input === "string") {
            return input;
        } else if (Array.isArray(input)) {
            return input.map(this.parseTextArray.bind(this)).join("");
        } else {
            switch (input.type) {
                case "bot_command":
                    // remove slash and split potential @
                    // examples:
                    // /command → command
                    // /command@bot → command @bot
                    return input.text.replace("/", "").replace("@", " @");

                case "hashtag":
                    // remove #
                    return input.text.replace("#", "");

                case "link":
                case "mention":
                    // add redundant spaces to the sides to make sure it will be tokenized correctly
                    return ` ${input.text} `;

                case "text_link":
                    return ` ${input.text} `;

                case "email":
                    // emails are removed
                    return "";

                default:
                    // by default just return the text
                    return input.text;
            }
        }
    }
}
