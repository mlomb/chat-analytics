import { FileInput, Timestamp } from "@pipeline/Types";
import { Parser } from "@pipeline/parse/Parser";
import { Author, Message } from "@pipeline/parse/Database";
import JSONStream from "@pipeline/parse/JSONStream";

import {
    DiscordChannel,
    DiscordGuild,
    DiscordMessage,
    DiscordAuthor,
    Snowflake,
} from "@pipeline/parse/DiscordParser.d";

export class DiscordParser extends Parser {
    private currentGuild: DiscordGuild | null = null;
    private currentChannel: DiscordChannel | null = null;
    private currentMessages: Message[] = [];
    private currentAuthors: Map<Snowflake, Author> = new Map();
    private lastMessageTimestamp: Timestamp = 0;

    constructor() {
        super("discord");
    }

    async *parse(file: FileInput) {
        const stream = new JSONStream(file);

        stream.onFull<DiscordGuild>("guild", (guild) => (this.currentGuild = guild));
        stream.onFull<DiscordChannel>("channel", (channel) => (this.currentChannel = channel));
        stream.onArray<DiscordMessage>("messages", this.parseMessage.bind(this));

        yield* stream.parse();

        // once streaming is done, update information based on the last message timestamp
        if (this.currentChannel) {
            this.addChannel({ id: this.currentChannel.id, name: this.currentChannel.name }, this.lastMessageTimestamp);
        }
        if (this.currentGuild) {
            this.updateTitle(this.currentGuild.name, this.lastMessageTimestamp);
        }

        // reset for the next channel
        this.currentGuild = null;
        this.currentChannel = null;
        this.currentMessages = [];
        this.currentAuthors = new Map();
        this.lastMessageTimestamp = 0;
    }

    parseMessage(message: DiscordMessage) {
        if (this.currentChannel === null) {
            throw new Error("Channel ID missing");
        }

        const timestamp = Date.parse(message.timestamp);
        /*
        let author: Author = {
            id: message.author.id,
            name: message.author.nickname,
            bot: message.author.isBot,
            discord: {
                // @ts-ignore (modulo)
                discriminator: parseInt(message.author.discriminator) % 5,
            },
        };
        if (message.author.avatarUrl) {
            // TODO: make sure size is 32px
            author.avatarUrl = message.author.avatarUrl;
        }
        if (message.author.color) {
            author.color = message.author.color;
        }

        // store author
        author = this.addAuthor(author, timestamp);

        // store message
        if (message.type == "Default") {
            this.addMessage({
                id: message.id,
                channelId: this.currentChannel.id,
                authorId: author.id,
                timestamp,
                content: message.content,
            });
        } else {
            //console.warn("Unhandled message type", message.type);
        }*/

        this.lastMessageTimestamp = Math.max(this.lastMessageTimestamp, timestamp);
    }
}
