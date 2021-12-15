import { FileInput } from "@pipeline/Types";
import { Parser } from "@pipeline/parse/Parser";
import { TelegramMessage, TextArray } from "@pipeline/parse/TelegramParser.d";

import JSONStream from "@pipeline/parse/JSONStream";

export class TelegramParser extends Parser {
    private channelId?: string;
    private channelName?: string;

    constructor() {
        super("telegram");
    }

    async *parse(file: FileInput) {
        const stream = new JSONStream(file);

        stream.onFull<string>("id", (channelId) => (this.channelId = channelId));
        stream.onFull<string>("title", (channelName) => (this.channelName = channelName));
        stream.onArray<TelegramMessage>("messages", this.parseMessage.bind(this));

        yield* stream.parse();

        if (this.channelId === undefined) throw new Error("Missing channel ID");

        if (this.channelName) this.updateTitle(this.channelName);
        this.addChannel({ id: this.channelId, name: this.channelName || this.database.title });

        this.channelId = undefined;
        this.channelName = undefined;
    }

    private parseMessage(message: TelegramMessage) {
        if (this.channelId === undefined) throw new Error("Missing channel ID");

        const authorId = message.from_id + "";
        const timestamp = Date.parse(message.date);

        if (!message.from) return; // TODO: fix

        this.addAuthor({
            id: authorId,
            name: message.from,
            bot: false, // TODO: mark all bot_command's as bot
        });

        if (message.type === "message") {
            this.addMessage({
                id: message.id + "",
                channelId: this.channelId,
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
