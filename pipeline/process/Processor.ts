import { RawID } from "@pipeline/Types";
import { Parser } from "@pipeline/parse/Parser";
import { PAuthor, PChannel, PGuild } from "@pipeline/parse/Types";
import { ChannelMessages, ProcessGroupFn } from "@pipeline/process/ChannelMessages";
import { IndexedData } from "@pipeline/process/IndexedData";
import { MessageProcessor } from "@pipeline/process/MessageProcessor";
import { Database } from "@pipeline/process/Types";

export class Processor {
    private guilds = new IndexedData<PGuild>();
    private channels = new IndexedData<PChannel>();
    private authors = new IndexedData<PAuthor>();

    private messagesInChannel = new Map<RawID, ChannelMessages>();

    private messageProcessor = new MessageProcessor();

    constructor(parser: Parser) {
        parser.on("guild", (guild, at) => this.guilds.store(guild, at));
        parser.on("channel", (channel, at) => this.channels.store(channel, at));
        parser.on("author", (author, at) => this.authors.store(author, at));
        parser.on("message", (message, at) => {
            if (!this.messagesInChannel.has(message.channelId))
                this.messagesInChannel.set(message.channelId, new ChannelMessages());
            this.messagesInChannel.get(message.channelId)!.addMessage(message);
        });
    }

    process() {
        console.log("Processing...");

        const processFn: ProcessGroupFn = this.messageProcessor.process.bind(this.messageProcessor);

        for (const mc of this.messagesInChannel.values()) {
            mc.process(processFn);
        }
    }

    /**
     * MUST be called to indicate that the end of a file has been reached.
     */
    markEOF() {
        for (const mc of this.messagesInChannel.values()) {
            mc.markEOF();
        }
    }

    getDatabase(): Database {
        console.log(this.messagesInChannel);

        for (const mc of this.messagesInChannel.values()) {
            for (const msg of mc.processedMessages()) {
                console.log(msg);
            }
        }

        return {
            config: {
                platform: "whatsapp",
            },
            title: "Chats",

            time: {
                minDate: "2020-01-01",
                maxDate: "2020-01-02",
                numDays: 1,
                numMonths: 1,
                numYears: 1,
            },

            guilds: this.guilds.data,
            channels: this.channels.data.map((c) => ({ name: c.name, type: c.type, guildIndex: 0 })),
            authors: this.authors.data.map((a) => ({ n: a.name })),
            messages: new Uint8Array(0),

            words: [],
            emojis: [],
            mentions: [],
            domains: [],

            serialized: new Uint8Array(0),
            authorsOrder: this.authors.data.map((a, i) => i),
            authorsBotCutoff: this.authors.size - 1,
            bitConfig: {
                dayBits: 21, // 12 + 4 + 5
                authorIdxBits: 21,
                wordIdxBits: 21,
                emojiIdxBits: 18,
                mentionsIdxBits: 20,
                domainsIdxBits: 16,
            },
        };
    }
}
