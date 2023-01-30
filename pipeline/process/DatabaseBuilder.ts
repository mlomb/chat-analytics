import { Env } from "@pipeline/Env";
import { Day, genTimeKeys } from "@pipeline/Time";
import { RawID, ReportConfig } from "@pipeline/Types";
import { Parser } from "@pipeline/parse/Parser";
import { PAuthor, PChannel, PGuild } from "@pipeline/parse/Types";
import { ChannelMessages, ProcessGroupFn } from "@pipeline/process/ChannelMessages";
import { IndexedMap } from "@pipeline/process/IndexedMap";
import { MessageProcessor } from "@pipeline/process/MessageProcessor";
import { Author, Channel, Database, Guild } from "@pipeline/process/Types";
import { BitStream } from "@pipeline/serialization/BitStream";
import { MessageBitConfig, writeMessage } from "@pipeline/serialization/MessageSerialization";

export class DatabaseBuilder {
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

    guildsReindex: number[] = [];
    channelsReindex: number[] = [];
    authorsReindex: number[] = [];
    wordsReindex: number[] = [];

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

        const guilds = this.guilds.remap<Guild>((guild) => guild, this.guildsReindex);
        const channels = this.channels.remap<Channel>(
            (channel) => ({
                name: channel.name,
                type: channel.type,
                guildIndex: this.guilds.getIndex(channel.guildId)!,
            }),
            this.channelsReindex
        );
        const authors = this.authors.remap<Author>(
            (author) => ({
                n: author.name,
                b: author.bot ? author.bot : undefined,
            }),
            this.authorsReindex
        );

        this.env.progress?.new("Compacting messages data");
        let messagesWritten = 0;
        const numBitsFor = (n: number) => (n === 0 ? 1 : 32 - Math.clz32(n));
        const finalStream = new BitStream();
        const finalBitConfig: MessageBitConfig = {
            dayBits: Math.max(1, numBitsFor(dateKeys.length)),
            authorIdxBits: Math.max(1, numBitsFor(this.authors.size)),
            wordIdxBits: Math.max(1, numBitsFor(this.messageProcessor.words.size)),
            emojiIdxBits: Math.max(1, numBitsFor(this.messageProcessor.emojis.size)),
            mentionsIdxBits: Math.max(1, numBitsFor(this.messageProcessor.mentions.size)),
            domainsIdxBits: Math.max(1, numBitsFor(this.messageProcessor.domains.size)),
        };
        for (const [id, mc] of this.messagesInChannel) {
            const channelIndex = this.channelsReindex[this.channels.getIndex(id)!];

            channels[channelIndex].msgAddr = finalStream.offset;
            channels[channelIndex].msgCount = 0;

            for (const msg of mc.processedMessages()) {
                writeMessage(
                    {
                        ...msg,
                        day: dateKeys.indexOf(Day.fromBinary(msg.day).dateKey),
                        authorIndex: this.authorsReindex[msg.authorIndex],
                    },
                    finalStream,
                    finalBitConfig
                );
                channels[channelIndex].msgCount!++;
            }
            this.env.progress?.progress("number", messagesWritten++, this.numMessages);
        }
        this.env.progress?.done();

        console.log(guilds);
        console.log(channels);
        console.log(authors);

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

            guilds,
            channels,
            authors,
            // round to the nearest multiple of 4
            messages: finalStream.buffer8.slice(0, ((Math.ceil(finalStream.offset / 8) + 3) & ~0x03) + 4),

            words: this.messageProcessor.words.values,
            emojis: this.messageProcessor.emojis.values,
            mentions: this.messageProcessor.mentions.values,
            domains: this.messageProcessor.domains.values,

            numMessages: this.numMessages,
            numBotAuthors: this.numBotAuthors,

            /////////////// ----------------------
            bitConfig: finalBitConfig,
        };
    }

    get numMessages() {
        return [...this.messagesInChannel.values()].reduce((acc, mc) => acc + mc.numMessages, 0);
    }

    get numBotAuthors() {
        return this.authors.values.reduce((acc, a) => acc + +a.bot, 0);
    }
}
