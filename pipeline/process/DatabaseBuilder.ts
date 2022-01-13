import {
    Author,
    BitAddress,
    Channel,
    Database,
    Emoji,
    IAuthor,
    IChannel,
    ID,
    IMessage,
    Index,
    IntermediateMessage,
    RawID,
    ReportConfig,
} from "@pipeline/Types";
import { Day, genTimeKeys } from "@pipeline/Time";
import { progress } from "@pipeline/Progress";
import { LanguageDetector, loadLanguageDetector } from "@pipeline/process/LanguageDetection";
import { Stopwords, loadStopwords } from "@pipeline/process/Stopwords";
import { stripDiacritics } from "@pipeline/process/Diacritics";
import { BitStream } from "@pipeline/serialization/BitStream";
import { tokenize } from "@pipeline/process/Tokenizer";
import {
    MessageBitConfig,
    readIntermediateMessage,
    writeIntermediateMessage,
} from "@pipeline/serialization/MessageSerialization";
import { IndexedData } from "@pipeline/process/IndexedData";

// TODO: !
const searchFormat = (x: string) => x.toLocaleLowerCase();

// section in the bitstream
type ChannelSection = {
    start: BitAddress;
    end: BitAddress;
};

// Hand picked values, hoping they work well
const DefaultBitConfig: MessageBitConfig = {
    dayBits: 21, // 12 + 4 + 5
    authorIdBits: 21,
    wordIdxBits: 21,
    emojiIdxBits: 18,
    mentionsIdxBits: 20,
    domainsIdxBits: 16,
};

export class DatabaseBuilder {
    private title: string = "Chat";
    private minDate: Day | undefined;
    private maxDate: Day | undefined;

    private channels = new IndexedData<RawID, Channel>();
    private authors = new IndexedData<RawID, Author>();
    private words = new IndexedData<string, string>();
    private emojis = new IndexedData<string, Emoji>();
    private mentions = new IndexedData<string, string>();
    private domains = new IndexedData<string, string>();

    get numChannels() { return this.channels.size; } // prettier-ignore
    get numAuthors() { return this.authors.size; } // prettier-ignore
    get numWords() { return this.words.size; } // prettier-ignore
    get numEmojis() { return this.emojis.size; } // prettier-ignore
    get numMentions() { return this.mentions.size; } // prettier-ignore

    // intermediate data
    private messageQueue: IMessage[] = []; // [ past ... future ]
    private totalMessages = 0;
    private authorMessagesCount: number[] = [];
    private channelSections: { [id: ID]: ChannelSection[] } = {};

    private stream: BitStream = new BitStream();
    private languageDetector?: LanguageDetector;
    private stopwords?: Stopwords;

    constructor(private readonly config: ReportConfig) {}

    public async init() {
        this.stopwords = await loadStopwords();
        this.languageDetector = await loadLanguageDetector();
    }

    public setTitle(title: string) {
        this.title = title;
    }

    public addChannel(rawId: RawID, channel: IChannel): Index {
        let index = this.channels.getIndex(rawId);
        if (index === undefined) {
            index = this.channels.set(rawId, {
                ...channel,
                ns: searchFormat(channel.n),
                msgAddr: 0,
                msgCount: 0,
            });
            progress.stat("channels", this.numChannels);
        }
        return index;
    }

    public addAuthor(rawId: RawID, author: IAuthor): ID {
        let index = this.authors.getIndex(rawId);
        if (index === undefined) {
            index = this.authors.set(rawId, {
                ...author,
                ns: searchFormat(author.n),
            });
            progress.stat("authors", this.numAuthors);
        }
        return index;
    }

    public addMessage(message: IMessage) {
        this.messageQueue.push(message);
    }

    // Process pending messages in the queue
    // if final is true, it means there are no more messages
    // of the current file (we can process the last group, and must clear the queue)
    // ❗ we are making a big assumption here: ONE file only contains messages from ONE channel
    public async process(final: boolean = false) {
        if (this.messageQueue.length === 0) return;

        const len = this.messageQueue.length;
        let l = 0,
            r = 1;
        let currentAuthor: Index = this.messageQueue[0].authorId;
        // [ M M M M M M M M ... ]
        //       ↑ l     ↑ r  (a group)
        while (r < len) {
            const message = this.messageQueue[r];
            if (message.authorId !== currentAuthor) {
                // process group
                const group = this.messageQueue.slice(l, r);
                await this.processGroup(group);
                currentAuthor = message.authorId;
                l = r;
            }
            r++;
        }

        if (final) {
            // process last group
            const group = this.messageQueue.slice(l, len);
            await this.processGroup(group);
            this.messageQueue = [];
        } else {
            // wait for more messages
            this.messageQueue = this.messageQueue.slice(l, len);
        }
    }

    // Inteaad of processing one message at a time, we process it
    // in contiguous groups which have the same author (and channel ofc)
    // Why? Because we can combine the content of the messages and
    // detect the language of the whole group, being more efficient and
    // more accurate (in general).
    private async processGroup(messages: IMessage[]) {
        if (!this.languageDetector) throw new Error("Language detector not initialized");
        if (!this.stopwords) throw new Error("Stopwords not initialized");

        const channelSection = this.getChannelSection(messages[0].channelId);

        // normalize and combine the content of the messages
        let combined: string[] = [];
        for (const msg of messages) {
            if (msg.content && msg.content.length > 0) {
                msg.content = msg.content
                    // normalize the content using NFC (we want the compositions)
                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
                    .normalize("NFC")
                    // change all whitespace to one space (important for the lang detector)
                    .replace(/\s\s+/g, " ")
                    // trim just in case
                    .trim();

                combined.push(msg.content);
            }
        }

        // detect language in the whole group
        let langIdx: number = -1;
        if (combined.length > 0) {
            // TODO: maybe we can filter out predictions with less than X chars, or % of confidence
            // TODO: also, we can combine the words tokenized and exclude URLs and stuff like that
            // langIdx = this.languageDetector.detectLine(combined.join(" "));
            langIdx = 42;
        }

        interface Counts {
            [idx: number]: number;
        }
        const countsToArray = (counts: Counts): [Index, number][] => {
            const res: [Index, number][] = [];
            for (const [idx, count] of Object.entries(counts)) {
                res.push([parseInt(idx), count]);
            }
            return res;
        };

        // now process each message
        for (const msg of messages) {
            // TODO: timezones
            const date = new Date(msg.timestamp);
            const day = Day.fromDate(date);
            if (this.minDate === undefined || Day.lt(day, this.minDate)) this.minDate = day;
            if (this.maxDate === undefined || Day.gt(day, this.maxDate)) this.maxDate = day;

            const wordsCount: Counts = {};
            const emojisCount: Counts = {};
            const mentionsCount: Counts = {};
            const reactionsCount: Counts = {};
            const domainsCount: Counts = {};

            if (msg.reactions) {
                for (const reaction of msg.reactions) {
                    let emojiIdx = this.emojis.getIndex(reaction[0].n);
                    if (emojiIdx === undefined) {
                        emojiIdx = this.emojis.set(reaction[0].n, {
                            id: reaction[0].id,
                            n: reaction[0].n,
                        });
                    } else if (this.emojis.get(emojiIdx).id === undefined && reaction[0].id) {
                        // ID is new, replace
                        this.emojis.setAt(emojiIdx, {
                            id: reaction[0].id,
                            n: reaction[0].n,
                        });
                    }
                    reactionsCount[emojiIdx] = (reactionsCount[emojiIdx] || 0) + reaction[1];
                }
            }

            if (msg.content) {
                // tokenize
                const tokens = tokenize(msg.content);
                for (const { tag, text } of tokens) {
                    if (tag === "word") {
                        // only keep words between [2, 25] chars
                        if (text.length > 1 && text.length <= 25) {
                            let wordIdx = this.words.getIndex(text);
                            if (wordIdx === undefined) wordIdx = this.words.set(text, text);
                            wordsCount[wordIdx] = (wordsCount[wordIdx] || 0) + 1;
                        }
                    } else if (tag === "emoji" || tag === "custom-emoji") {
                        let emojiIdx = this.emojis.getIndex(text);
                        if (emojiIdx === undefined) emojiIdx = this.emojis.set(text, { n: text });
                        emojisCount[emojiIdx] = (emojisCount[emojiIdx] || 0) + 1;
                    } else if (tag === "mention") {
                        let mentionIdx = this.mentions.getIndex(text);
                        if (mentionIdx === undefined) mentionIdx = this.mentions.set(text, text);
                        mentionsCount[mentionIdx] = (mentionsCount[mentionIdx] || 0) + 1;
                    } else if (tag === "url") {
                        try {
                            const hostname = new URL(text).hostname;
                            let domainIdx = this.domains.getIndex(hostname);
                            if (domainIdx === undefined) domainIdx = this.domains.set(hostname, hostname);
                            domainsCount[domainIdx] = (domainsCount[domainIdx] || 0) + 1;
                        } catch (ex) {}
                    }
                }
            }

            // store message
            writeIntermediateMessage(
                <IntermediateMessage>{
                    day: day.toBinary(),
                    // TODO: timezones
                    hour: date.getHours(),
                    authorId: msg.authorId,
                    words: countsToArray(wordsCount),
                    emojis: countsToArray(emojisCount),
                    mentions: countsToArray(mentionsCount),
                    reactions: countsToArray(reactionsCount),
                    domains: countsToArray(domainsCount),
                    // TODO: should be combined
                    attachments: msg.attachments.map((a) => [a, 1]),
                    langIdx,
                    sentiment: 42,
                },
                this.stream,
                DefaultBitConfig
            );
            // extend section
            channelSection.end = this.stream.offset;
            this.authorMessagesCount[msg.authorId] = (this.authorMessagesCount[msg.authorId] || 0) + 1;
            progress.stat("messages", this.totalMessages++);
        }
    }

    private getChannelSection(channelId: ID): ChannelSection {
        if (!(channelId in this.channelSections)) {
            this.channelSections[channelId] = [{ start: this.stream.offset, end: this.stream.offset }];
        }
        const sections = this.channelSections[channelId];
        const lastSection = sections[sections.length - 1];
        if (lastSection.end === this.stream.offset) return lastSection;
        else {
            // create new section (non-contiguous)
            sections.push({ start: this.stream.offset, end: this.stream.offset });
            return sections[sections.length - 1];
        }
    }

    public getDatabase(): Database {
        if (this.minDate === undefined || this.maxDate === undefined) throw new Error("No messages processed");

        const { dateKeys, monthKeys } = genTimeKeys(this.minDate, this.maxDate);
        const { authorsOrder, authorsBotCutoff } = this.sortAuthors();

        progress.new("Compacting messages data");
        // how many bits are needed to store n (n > 0)
        const numBitsFor = (n: number) => 32 - Math.clz32(n);
        const finalStream = new BitStream();
        const finalBitConfig: MessageBitConfig = {
            dayBits: Math.max(1, numBitsFor(dateKeys.length)),
            authorIdBits: Math.max(1, numBitsFor(this.authors.size)),
            wordIdxBits: Math.max(1, numBitsFor(this.words.size)),
            emojiIdxBits: Math.max(1, numBitsFor(this.emojis.size)),
            mentionsIdxBits: Math.max(1, numBitsFor(this.mentions.size)),
            domainsIdxBits: Math.max(1, numBitsFor(this.domains.size)),
        };
        let messagesWritten = 0;
        for (const channelId in this.channelSections) {
            this.channels.data[channelId].msgAddr = finalStream.offset;
            for (const section of this.channelSections[channelId]) {
                // seek
                this.stream.offset = section.start;
                while (this.stream.offset < section.end) {
                    const msg = readIntermediateMessage(this.stream, DefaultBitConfig);

                    msg.day = dateKeys.indexOf(Day.fromBinary(msg.day).dateKey);

                    // write final message
                    writeIntermediateMessage(msg, finalStream, finalBitConfig);
                    progress.progress("number", messagesWritten++, this.totalMessages);
                    this.channels.data[channelId].msgCount++;
                }
            }
        }
        progress.done();

        // TODO: sort words, reindex
        // TODO: filter words more efficiently
        // debugger;

        console.log("size", finalStream.offset / 8, "bytes", require("pretty-bytes")(finalStream.offset / 8));

        return {
            config: this.config,
            bitConfig: finalBitConfig,
            title: this.title,
            time: {
                minDate: this.minDate.dateKey,
                maxDate: this.maxDate.dateKey,
                numDays: dateKeys.length,
                numMonths: monthKeys.length,
            },
            channels: this.channels.data,
            authors: this.authors.data,
            words: this.words.data,
            emojis: this.emojis.data,
            mentions: this.mentions.data,
            domains: this.domains.data,

            authorsOrder,
            authorsBotCutoff,

            // round to the nearest multiple of 4
            serialized: finalStream.buffer8.slice(0, ((Math.ceil(finalStream.offset / 8) + 3) & ~0x03) + 4),
        };
    }

    private sortAuthors(): {
        authorsOrder: ID[];
        authorsBotCutoff: number;
    } {
        progress.new("Sorting authors");
        const authorsOrder: ID[] = Array.from({ length: this.authors.size }, (_, i) => i);
        authorsOrder.sort((a, b) =>
            // first non-bots, then by messages count
            this.authors.data[a].b === this.authors.data[b].b
                ? this.authorMessagesCount[b] - this.authorMessagesCount[a]
                : +(this.authors.data[a].b || false) - +(this.authors.data[b].b || false)
        );
        const authorsBotCutoff: number = authorsOrder.findIndex((i) => this.authors.data[i].b);
        progress.done();
        return { authorsOrder, authorsBotCutoff };
    }
}
