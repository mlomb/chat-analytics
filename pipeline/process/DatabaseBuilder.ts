import { Env } from "@pipeline/Env";
import { Day, genTimeKeys } from "@pipeline/Time";
import { RawID, ReportConfig } from "@pipeline/Types";
import { createParser } from "@pipeline/parse";
import { FileInput } from "@pipeline/parse/File";
import { Parser } from "@pipeline/parse/Parser";
import { PAuthor, PChannel, PGuild } from "@pipeline/parse/Types";
import { ChannelMessages, ProcessGroupFn } from "@pipeline/process/ChannelMessages";
import { IndexedMap } from "@pipeline/process/IndexedMap";
import { MessageProcessor } from "@pipeline/process/MessageProcessor";
import { Author, Channel, Database, Emoji, Guild } from "@pipeline/process/Types";
import { BitStream } from "@pipeline/serialization/BitStream";
import { MessageBitConfig, writeMessage } from "@pipeline/serialization/MessageSerialization";

/**
 *
 */
export class DatabaseBuilder {
    parser: Parser;

    minDate = Day.HIGHEST;
    maxDate = Day.LOWEST;

    guilds = new IndexedMap<RawID, PGuild>();
    channels = new IndexedMap<RawID, PChannel>();
    authors = new IndexedMap<RawID, PAuthor>();
    words = new IndexedMap<string, string>();
    emojis = new IndexedMap<string, Emoji>();
    mentions = new IndexedMap<string, string>();
    domains = new IndexedMap<string, string>();

    /** Each channel has its own ChannelMessages instance */
    messagesInChannel = new Map<RawID, ChannelMessages>();

    /** Global messages processor */
    messageProcessor = new MessageProcessor(this);
    /** Function used to process a group of messages */
    processFn: ProcessGroupFn = this.messageProcessor.processGroupToIntermediate.bind(this.messageProcessor);

    get numChannels() { return this.channels.size; } // prettier-ignore
    get numAuthors() { return this.authors.size; } // prettier-ignore
    get numBotAuthors() { return this.authors.values.reduce((acc, a) => acc + +a.bot, 0); } // prettier-ignore
    get numWords() { return this.words.size; } // prettier-ignore
    get numEmojis() { return this.emojis.size; } // prettier-ignore
    get numMentions() { return this.mentions.size; } // prettier-ignore
    get numMessages() { return [...this.messagesInChannel.values()].reduce((acc, mc) => acc + mc.numMessages, 0); } // prettier-ignore

    constructor(private readonly config: ReportConfig, private readonly env: Env) {
        this.parser = createParser(config.platform);
        this.parser.on("guild", (guild, at) => this.guilds.set(guild.id, guild, at));
        this.parser.on("channel", (channel, at) => this.channels.set(channel.id, channel, at));
        this.parser.on("author", (author, at) => this.authors.set(author.id, author, at));
        this.parser.on("message", (message, at) => {
            let channelMessages = this.messagesInChannel.get(message.channelId);
            if (channelMessages === undefined) {
                // new channel found
                channelMessages = new ChannelMessages();
                this.messagesInChannel.set(message.channelId, channelMessages);
            }
            channelMessages.addMessage(message);
        });
    }

    /** Initialize static data. Must be called before `processFiles` */
    async init() {
        await this.messageProcessor.init(this.env);
    }

    /** Process the provided files */
    async processFiles(files: FileInput[]) {
        let filesProcessed = 0;

        for (const file of files) {
            this.env.progress?.new("Processing", file.name);

            try {
                for await (const _ of this.parser.parse(file, this.env.progress)) this.processPendingMessages();
            } catch (err) {
                if (err instanceof Error) {
                    const newErr = new Error(`Error parsing file "${file.name}":\n\n${err.message}`);
                    newErr.stack = err.stack;
                    throw newErr;
                }
                // handled by WorkerApp.ts
                throw err;
            }
            this.markEOF();
            this.processPendingMessages();

            this.env.progress?.done();
            this.env.progress?.stat("processed_files", ++filesProcessed);
            this.env.progress?.stat("total_files", files.length);
        }
    }

    /** Goes through all ChannelMessage and process all the messages that remain pending */
    private processPendingMessages() {
        for (const chMsgs of this.messagesInChannel.values()) {
            chMsgs.process(this.processFn);
        }

        // update stats
        this.env.progress?.stat("channels", this.numChannels);
        this.env.progress?.stat("authors", this.numAuthors);
        this.env.progress?.stat("messages", this.numMessages);
    }

    /** Singnals EOF to all ChannelMessages. MUST be called */
    private markEOF() {
        for (const chMsgs of this.messagesInChannel.values()) {
            chMsgs.markEOF();
        }
    }

    /////////////////////////////////////////////////////
    //                                                 //
    //             REINDEX / MAKE FINAL                //
    //                                                 //
    /////////////////////////////////////////////////////

    guildsReindex: number[] = [];
    channelsReindex: number[] = [];
    authorsReindex: number[] = [];
    wordsReindex: number[] = [];

    /**
     * [+] Why indexing?
     * While we process messages it is more efficient to store an index to the actual author/word/whatever
     * than storing a full RawID that may potentially be a large string.
     * [+] Why the burden of reindexing?
     * We want to sort authors, channels and such by the number of messages they have, so it doesn't need to
     * be done in the UI (also all indexes end up being nice :) )
     * [+] How?
     * During processing we use the index that IndexedMap provides. After all processing is done (this function)
     * we count the messages and then generate a mapping between the old index and the "final" ones with `reindex`.
     */
    private countAndReindex() {
        this.env.progress?.new("Counting for reindex...");

        const totalMessages = this.numMessages;
        let alreadyCounted = 0;

        // we use Uint32Array because it's faster than an array
        let guildCounts = new Uint32Array(this.guilds.size);
        let channelCounts = new Uint32Array(this.channels.size);
        let authorCounts = new Uint32Array(this.authors.size);
        let wordsCounts = new Uint32Array(this.words.size);

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

        this.guildsReindex = this.guilds.reindex((idx) => guildCounts[idx]);
        this.channelsReindex = this.channels.reindex((idx) => channelCounts[idx]);
        this.authorsReindex = this.authors.reindex((idx) => authorCounts[idx]);
        this.wordsReindex = this.words.reindex((idx) => wordsCounts[idx]);

        this.env.progress?.done();
    }

    /** Transforms a parser PChannel into a final Channel */
    makeFinalChannel(channel: PChannel): Channel {
        return {
            name: channel.name,
            type: channel.type,
            guildIndex: this.guildsReindex[this.guilds.getIndex(channel.guildId)!],

            // the following are set making the final messages
            msgAddr: undefined,
            msgCount: undefined,
        };
    }

    /** Transforms a parser PAuthor into a final Author */
    makeFinalAuthor(author: PAuthor): Author {
        return {
            n: author.name,
            b: author.bot === true ? true : undefined,
        };
    }

    makeFinalMessages() {}

    build(): Database {
        this.countAndReindex();

        const { dateKeys, monthKeys, yearKeys } = genTimeKeys(this.minDate, this.maxDate);

        const guilds = this.guilds.remap<Guild>((guild) => guild, this.guildsReindex);
        const channels = this.channels.remap<Channel>(this.makeFinalChannel.bind(this), this.channelsReindex);
        const authors = this.authors.remap<Author>(this.makeFinalAuthor.bind(this), this.authorsReindex);

        /** Return the minimum amount of bits needed to store a given number */
        const numBitsFor = (n: number) => Math.max(1, n === 0 ? 1 : 32 - Math.clz32(n));

        const messagesStream = new BitStream();
        const bitConfig: MessageBitConfig = {
            dayBits: numBitsFor(dateKeys.length),
            authorIdxBits: numBitsFor(this.authors.size),
            wordIdxBits: numBitsFor(this.words.size),
            emojiIdxBits: numBitsFor(this.emojis.size),
            mentionsIdxBits: numBitsFor(this.mentions.size),
            domainsIdxBits: numBitsFor(this.domains.size),
        };

        {
            this.env.progress?.new("Compacting messages data");

            const totalMessages = this.numMessages;
            let alreadyCounted = 0;

            for (const [id, mc] of this.messagesInChannel) {
                const channelIndex = this.channelsReindex[this.channels.getIndex(id)!];

                channels[channelIndex].msgAddr = messagesStream.offset;
                channels[channelIndex].msgCount = mc.numMessages;

                for (const msg of mc.processedMessages()) {
                    writeMessage(
                        {
                            ...msg,
                            day: dateKeys.indexOf(Day.fromBinary(msg.day).dateKey),
                            authorIndex: this.authorsReindex[msg.authorIndex],
                        },
                        messagesStream,
                        bitConfig
                    );
                }
                this.env.progress?.progress("number", ++alreadyCounted, totalMessages);
            }
            this.env.progress?.done();
        }

        return {
            config: this.config,
            title: "Chats",

            time: {
                minDate: this.minDate.dateKey,
                maxDate: this.maxDate.dateKey,
                numDays: dateKeys.length,
                numMonths: monthKeys.length,
                numYears: yearKeys.length,
            },

            guilds,
            channels,
            authors,
            words: this.words.values,
            emojis: this.emojis.values,
            mentions: this.mentions.values,
            domains: this.domains.values,

            // round to the nearest multiple of 4
            messages: messagesStream.buffer8.slice(0, ((Math.ceil(messagesStream.offset / 8) + 3) & ~0x03) + 4),
            numMessages: this.numMessages,
            bitConfig,
        };
    }
}
