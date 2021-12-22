import { FileInput, ID, RawID } from "@pipeline/Types";
import { Parser } from "@pipeline/parse/Parser";
import { TelegramMessage, TextArray } from "@pipeline/parse/TelegramParser.d";

import JSONStream from "@pipeline/shared/JSONStream";
import { streamJSONFromFile } from "@pipeline/Utils";

export class TelegramParser extends Parser {
    private channelName?: string;
    private channelId?: ID;

    constructor() {
        super("telegram");
    }

    async *parse(file: FileInput) {
        const stream = new JSONStream();

        stream.onFull<string>("name", (channelName) => {
            this.channelName = channelName;
            this.updateTitle(channelName);
        });
        stream.onFull<string>("id", (rawChannelId) => {
            this.channelId = this.addChannel(rawChannelId, { name: this.channelName || this.database.title });
        });
        stream.onArray<TelegramMessage>("messages", this.parseMessage.bind(this));

        yield* streamJSONFromFile(stream, file);

        this.channelName = undefined;
        this.channelId = undefined;
    }

    private parseMessage(message: TelegramMessage) {
        if (this.channelId === undefined) throw new Error("Missing channel ID (2)");

        const rawAuthorId: RawID = message.from_id + "";
        const timestamp = Date.parse(message.date);

        if (!message.from) return; // TODO: fix

        const authorId = this.addAuthor(rawAuthorId, {
            name: message.from,
            bot: false, // TODO: mark all bot_command's as bot
        });

        if (message.type === "message") {
            this.addMessage(message.id, this.channelId, {
                authorId,
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
