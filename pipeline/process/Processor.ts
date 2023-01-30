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

    private messageProcessor = new MessageProcessor(this.authors);

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

        const processFn: ProcessGroupFn = this.messageProcessor.processGroupToIntermediate.bind(this.messageProcessor);

        for (const mc of this.messagesInChannel.values()) {
            mc.process(processFn);
        }
    }

    /** MUST be called to indicate that the end of an input file has been reached */
    markEOF() {
        for (const channelMessages of this.messagesInChannel.values()) channelMessages.markEOF();
    }

    guildsReindex?: number[];
    channelsReindex?: number[];
    authorsReindex?: number[];
    wordsReindex?: number[];

    /**
     * count things
     * reindex things
     */
    private countAndReindex() {
        this.env.progress?.new("Counting for reindex...");

        const totalMessages = this.numMessages;
        let alreadyCounted = 0;

        let guildCounts = new Uint32Array(this.guilds.size);
        let channelCounts = new Uint32Array(this.channels.size);
        let authorCounts = new Uint32Array(this.authors.size);
        let wordsCounts = new Uint32Array(this.messageProcessor.words.size);

        for (const [id, mc] of this.messagesInChannel) {
            const channelIndex = this.channels.getIndex(id)!;
            const guildIndex = this.guilds.getIndex(this.channels.getByIndex(channelIndex)!.guildId)!;

            for (const msg of mc.processedMessages()) {
                guildCounts[guildIndex]++;
                channelCounts[channelIndex]++;
                authorCounts[msg.authorIndex]++;

                if (msg.words) {
                    for (const [idx, count] of msg.words) wordsCounts[idx] += count;
                }

                this.env.progress?.progress("number", ++alreadyCounted, totalMessages);
            }
        }

        this.env.progress?.done();
        this.env.progress?.new("Reindexing...");

        const reindexAuthor = (idx: number) => {
            // reindexing the author is a bit special,
            // we want non bot authors first, and then
            // sorted by amount of messages
            const author = this.authors.getByIndex(idx)!;
            return (author.bot ? 0 : 1) * 1000000000 + authorCounts[idx];
        };

        this.guildsReindex = this.guilds.reindex((idx) => guildCounts[idx]);
        this.channelsReindex = this.channels.reindex((idx) => channelCounts[idx]);
        this.authorsReindex = this.authors.reindex(reindexAuthor);
        this.wordsReindex = this.messageProcessor.words.reindex((idx) => wordsCounts[idx]);

        this.env.progress?.done();
    }

    getDatabase(): Database {
        this.countAndReindex();

        console.log(this);
        const { dateKeys, monthKeys, yearKeys } = genTimeKeys(
            this.messageProcessor.minDate!,
            this.messageProcessor.maxDate!
        );

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

            numBotAuthors: this.numBotAuthors,

            /////////////// ----------------------
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

    get numMessages() {
        return [...this.messagesInChannel.values()].reduce((acc, mc) => acc + mc.numMessages, 0);
    }

    get numBotAuthors() {
        return this.authors.values.reduce((acc, a) => acc + +a.bot, 0);
    }
}
