import { Env } from "@pipeline/Env";
import { genTimeKeys } from "@pipeline/Time";
import { RawID, ReportConfig } from "@pipeline/Types";
import { Parser } from "@pipeline/parse/Parser";
import { PAuthor, PChannel, PGuild } from "@pipeline/parse/Types";
import { ChannelMessages, ProcessGroupFn } from "@pipeline/process/ChannelMessages";
import { IndexedMap } from "@pipeline/process/IndexedMap";
import { MessageProcessor } from "@pipeline/process/MessageProcessor";
import { Database } from "@pipeline/process/Types";

export class Processor {
    private guilds = new IndexedMap<RawID, PGuild>();
    private channels = new IndexedMap<RawID, PChannel>();
    private authors = new IndexedMap<RawID, PAuthor>();

    private messagesInChannel = new Map<RawID, ChannelMessages>();

    private messageProcessor = new MessageProcessor();

    constructor(parser: Parser, private readonly config: ReportConfig, private readonly env: Env) {
        parser.on("guild", (guild, at) => this.guilds.set(guild.id, guild, at));
        parser.on("channel", (channel, at) => this.channels.set(channel.id, channel, at));
        parser.on("author", (author, at) => this.authors.set(author.id, author, at));
        parser.on("message", (message, at) => {
            if (!this.messagesInChannel.has(message.channelId))
                this.messagesInChannel.set(message.channelId, new ChannelMessages());
            this.messagesInChannel.get(message.channelId)!.addMessage(message);
        });
    }

    async init() {
        await this.messageProcessor.init(this.env);
    }

    process() {
        console.log("Processing...");

        const processFn: ProcessGroupFn = this.messageProcessor.process.bind(this.messageProcessor);

        for (const mc of this.messagesInChannel.values()) {
            mc.process(processFn);
        }
    }

    /** MUST be called to indicate that the end of an input file has been reached */
    markEOF() {
        for (const channelMessages of this.messagesInChannel.values()) channelMessages.markEOF();
    }

    getDatabase(): Database {
        console.log(this.messagesInChannel);

        const { dateKeys, monthKeys, yearKeys } = genTimeKeys(
            this.messageProcessor.minDate!,
            this.messageProcessor.maxDate!
        );

        /*for (const mc of this.messagesInChannel.values()) {
            for (const msg of mc.processedMessages()) {
                console.log(msg);
            }
        }*/

        return {
            config: this.config,
            title: "Chats",

            time: {
                minDate: this.messageProcessor.minDate!.dateKey,
                maxDate: this.messageProcessor.maxDate!.dateKey,
                numDays: dateKeys.length,
                numMonths: monthKeys.length,
                numYears: yearKeys.length,
            },

            guilds: this.guilds.values,
            channels: this.channels.values.map((c) => ({ name: c.name, type: c.type, guildIndex: 0 })),
            authors: this.authors.values.map((a) => ({ n: a.name })),
            messages: new Uint8Array(0),

            words: this.messageProcessor.words.values,
            emojis: this.messageProcessor.emojis.values,
            mentions: this.messageProcessor.mentions.values,
            domains: this.messageProcessor.domains.values,

            /////////////// ----------------------
            serialized: new Uint8Array(0),
            authorsOrder: this.authors.values.map((a, i) => i),
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
