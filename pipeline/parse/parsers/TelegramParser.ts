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

        const rawAuthorId: RawID = message.from_id + "";
        const timestamp = Date.parse(message.date);

        if (!message.from) return; // TODO: fix

        const authorId = this.builder.addAuthor(rawAuthorId, {
            n: message.from,
            b: false, // TODO: mark all bot_command's as bot
        });

        if (message.type === "message") {
            this.builder.addMessage({
                authorId,
                channelId: this.channelId,
                content: this.parseTextArray(message.text),
                timestamp,
            });
        }
    }

    private parseTextArray(text: string | TextArray[]): string {
        if (typeof text === "string") {
            return text;
        } else {
            // TODO: parse text array correctly
            return text.map((t: any) => t.text).join(" ");
        }
    }
}
