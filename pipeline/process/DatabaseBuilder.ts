import prettyBytes from "pretty-bytes";

import { Env } from "@pipeline/Env";
import { LanguageCodes } from "@pipeline/Languages";
import { Emojis, EmojisData } from "@pipeline/process/Emojis";
import { FastTextModel, loadFastTextModel } from "@pipeline/process/FastTextModel";
import { IndexedData } from "@pipeline/process/IndexedData";
import { Sentiment } from "@pipeline/process/Sentiment";
import { Token, tokenize } from "@pipeline/process/Tokenizer";
import { progress } from "@pipeline/Progress";
import { BitStream } from "@pipeline/serialization/BitStream";
import { MessageBitConfig, readMessage, writeMessage } from "@pipeline/serialization/MessageSerialization";
import { matchFormat, normalizeText } from "@pipeline/Text";
import { Day, genTimeKeys } from "@pipeline/Time";
import {
    Author,
    BitAddress,
    Channel,
    Database,
    Emoji,
    Guild,
    IMessage,
    Index,
    Message,
    RawID,
    ReportConfig,
} from "@pipeline/Types";

// section in the bitstream
type ChannelSection = {
    start: BitAddress;
    end: BitAddress;
};

// hand-picked values, hoping they work well
const DefaultBitConfig: MessageBitConfig = {
    dayBits: 21, // 12 + 4 + 5
    authorIdxBits: 21,
    wordIdxBits: 21,
    emojiIdxBits: 18,
    mentionsIdxBits: 20,
    domainsIdxBits: 16,
};

export class DatabaseBuilder {
    private minDate: Day | undefined;
    private maxDate: Day | undefined;

    private guilds = new IndexedData<RawID, Guild>();
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
    private stream: BitStream = new BitStream();
    private messageQueue: IMessage[] = []; // [ past ... future ]
    private totalMessages = 0;
    private channelSections: { [index: Index]: ChannelSection[] } = {};
    // keep track of some counts
    private authorMessagesCount: number[] = [];
    private wordsCount: number[] = [];
    private languagesCount: { [lang: number]: number } = {};
    // keep a window of IDs to calculate replyOffset
    private recentIDs: RawID[] = [];

    // static data
    private stopwords: Set<string> = new Set();
    private langPredictModel: FastTextModel | null = null;
    private emojisData: Emojis | null = null;
    private sentiment: Sentiment | null = null;

    constructor(private readonly config: ReportConfig, private readonly env: Env) {}

    // download static data
    public async init() {
        // load stopwords
        {
            interface StopwordsJSON {
                [lang: string]: string[];
            }
            const data = await this.env.loadAsset<StopwordsJSON>("/data/text/stopwords-iso.json", "json");

            // combining all stopwords is a mistake?
            this.stopwords = new Set(
                Object.values(data)
                    .reduce((acc, val) => acc.concat(val), [])
                    .map((word) => matchFormat(word))
            );
        }

        // load language detector model
        this.langPredictModel = await loadFastTextModel("lid.176", this.env);

        // load emoji data
        {
            const data = await this.env.loadAsset<EmojisData>("/data/emojis/emoji-data.json", "json");
            this.emojisData = new Emojis(data);
        }

        // load sentiment data
        {
            const afinnZipBuffer = await this.env.loadAsset("/data/text/AFINN.zip", "arraybuffer");
            this.sentiment = new Sentiment(afinnZipBuffer, this.emojisData);
        }
    }

    // NOTE: assumes the word is normalized and contains no newlines
    private detectLanguageLine(line: string) {
        const result = this.langPredictModel!.predict(line, 1, 0.0);
        const code = result[0][1].slice(9); // "__label__".length === 9
        return {
            accuracy: result[0][0],
            // ISO 639-2/3
            iso639: code,
            index: LanguageCodes.indexOf(code),
        };
    }

    public addGuild(rawId: RawID, guild: Guild): Index {
        let index = this.guilds.getIndex(rawId);
        if (index === undefined) {
            index = this.guilds.set(rawId, guild);
        }
        return index;
    }

    public addChannel(rawId: RawID, channel: Channel): Index {
        let index = this.channels.getIndex(rawId);
        if (index === undefined) {
            index = this.channels.set(rawId, {
                ...channel,
                msgAddr: 0,
                msgCount: 0,
            });
            progress.stat("channels", this.numChannels);
        }
        return index;
    }

    public addAuthor(rawId: RawID, author: Author): Index {
        let index = this.authors.getIndex(rawId);
        if (index === undefined) {
            index = this.authors.set(rawId, author);
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
    public process(final: boolean = false) {
        if (this.messageQueue.length === 0) return;

        const len = this.messageQueue.length;
        let currentAuthor: Index = this.messageQueue[0].authorIndex;
        // [ M M M M M M M M ... ]
        //       ↑ l     ↑ r  (a group)
        let l = 0,
            r = 1;
        while (r < len) {
            const authorIndex = this.messageQueue[r].authorIndex;
            if (authorIndex !== currentAuthor) {
                // process group
                const group = this.messageQueue.slice(l, r);
                this.processGroup(group);
                currentAuthor = authorIndex;
                l = r;
            }
            r++;
        }

        if (final) {
            // process last group
            const group = this.messageQueue.slice(l, len);
            this.processGroup(group);
            this.messageQueue = [];
            this.recentIDs = [];
        } else {
            // wait for more messages
            this.messageQueue = this.messageQueue.slice(l, len);
        }
    }

    // Instead of processing one message at a time, we process it
    // in contiguous groups which have the same author (and channel ofc)
    // Why? Because we can combine the content of the messages and
    // detect the language of the whole group, being more efficient and
    // more accurate (in general).
    private processGroup(messages: Readonly<IMessage>[]) {
        const channelSection = this.getChannelSection(messages[0].channelIndex);

        // if this channel is a DM, store author IDs
        const channel = this.channels.get(messages[0].channelIndex);
        if (channel.type === "dm") {
            const authorIdx = messages[0].authorIndex;

            if (channel.dmAuthorIndexes === undefined) {
                channel.dmAuthorIndexes = [authorIdx];
            } else if (!channel.dmAuthorIndexes.includes(authorIdx)) {
                channel.dmAuthorIndexes.push(authorIdx);
            }
        }

        // normalize and tokenize messages
        const tokenizations: Token[][] = [];
        for (const msg of messages) {
            if (msg.content && msg.content.length > 0) {
                tokenizations.push(tokenize(normalizeText(msg.content)));
            } else {
                tokenizations.push([]);
            }
        }

        // detect language in the whole group
        let langIndex: number = 0;
        const combined: string[] = [];
        for (const tokens of tokenizations) {
            for (const token of tokens) {
                // only keep words
                if (token.tag === "word") combined.push(token.text.toLowerCase());
            }
        }
        if (combined.length > 0) {
            const combinedWords = combined.join(" ");
            const prediction = this.detectLanguageLine(combinedWords);
            langIndex = prediction.index;
            this.languagesCount[langIndex] = (this.languagesCount[langIndex] || 0) + 1;
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
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];

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
                    const emojiKey = normalizeText(reaction[0].n).toLowerCase();

                    const emojiObj: Emoji = {
                        id: reaction[0].id,
                        n: reaction[0].id ? reaction[0].n : this.emojisData!.getName(emojiKey),
                        c: reaction[0].id ? undefined : emojiKey,
                    };

                    let emojiIdx = this.emojis.getIndex(emojiKey);
                    if (emojiIdx === undefined) {
                        emojiIdx = this.emojis.set(emojiKey, emojiObj);
                    } else if (this.emojis.get(emojiIdx).id === undefined && reaction[0].id) {
                        // ID is new, replace
                        this.emojis.setAt(emojiIdx, emojiObj);
                    }
                    reactionsCount[emojiIdx] = (reactionsCount[emojiIdx] || 0) + reaction[1];
                }
            }

            // parse tokens
            let sentiment = 0;
            let hasText = false;
            const tokens = tokenizations[i];
            if (tokens.length > 0) {
                // process tokens
                for (const { tag, text } of tokens) {
                    if (tag === "word") {
                        const wordKey = matchFormat(text);
                        // only keep words between [2, 30] chars and no stopwords
                        if (text.length > 1 && text.length <= 30 && !this.stopwords.has(wordKey)) {
                            let wordIdx = this.words.getIndex(wordKey);
                            if (wordIdx === undefined) wordIdx = this.words.set(wordKey, text);
                            wordsCount[wordIdx] = (wordsCount[wordIdx] || 0) + 1;
                            this.wordsCount[wordIdx] = (this.wordsCount[wordIdx] || 0) + 1;
                        }
                        hasText = true;
                    } else if (tag === "emoji" || tag === "custom-emoji") {
                        const emojiKey = text.toLowerCase();
                        let emojiIdx = this.emojis.getIndex(emojiKey);
                        if (emojiIdx === undefined) {
                            const emojiObj: Emoji =
                                tag === "emoji"
                                    ? {
                                          c: text,
                                          n: this.emojisData!.getName(text),
                                      }
                                    : {
                                          n: text,
                                      };
                            emojiIdx = this.emojis.set(emojiKey, emojiObj);
                        }
                        emojisCount[emojiIdx] = (emojisCount[emojiIdx] || 0) + 1;
                    } else if (tag === "mention") {
                        const mentionKey = matchFormat(text);
                        let mentionIdx = this.mentions.getIndex(mentionKey);
                        if (mentionIdx === undefined) mentionIdx = this.mentions.set(mentionKey, text);
                        mentionsCount[mentionIdx] = (mentionsCount[mentionIdx] || 0) + 1;
                    } else if (tag === "url") {
                        // TODO: transform URL only messages to attachments
                        try {
                            const hostname = new URL(text).hostname.toLowerCase();

                            let domainIdx = this.domains.getIndex(hostname);
                            if (domainIdx === undefined) domainIdx = this.domains.set(hostname, hostname);

                            domainsCount[domainIdx] = (domainsCount[domainIdx] || 0) + 1;
                        } catch (ex) {}
                    }
                }

                // sentiment analysis
                if (hasText) {
                    sentiment = this.sentiment?.get(tokens, langIndex) || 0;
                }
            }

            // reply offset
            // add this message to the window
            this.recentIDs.push(msg.id);
            let replyOffset = undefined;
            if (msg.replyTo) {
                replyOffset = this.recentIDs.indexOf(msg.replyTo);
                if (replyOffset === -1)
                    replyOffset = 0; // message too far / message in another file (probably, not supported)
                else replyOffset = this.recentIDs.length - replyOffset - 1;
            }
            // only keep last 1020 messages in the window
            if (this.recentIDs.length > 1020) this.recentIDs.shift();

            // store message
            writeMessage(
                <Message>{
                    day: day.toBinary(),
                    // TODO: timezones
                    secondOfDay: date.getSeconds() + 60 * (date.getMinutes() + 60 * date.getHours()),
                    authorIndex: msg.authorIndex,
                    replyOffset,
                    langIndex: hasText ? langIndex : undefined,
                    sentiment: hasText ? sentiment : undefined,
                    words: countsToArray(wordsCount),
                    emojis: countsToArray(emojisCount),
                    mentions: countsToArray(mentionsCount),
                    reactions: countsToArray(reactionsCount),
                    domains: countsToArray(domainsCount),
                    // TODO: should be combined
                    attachments: msg.attachments.map((a) => [a, 1]),
                },
                this.stream,
                DefaultBitConfig
            );
            // extend section
            channelSection.end = this.stream.offset;
            this.authorMessagesCount[msg.authorIndex] = (this.authorMessagesCount[msg.authorIndex] || 0) + 1;
            progress.stat("messages", this.totalMessages++);
        }
    }

    private getChannelSection(channelIndex: Index): ChannelSection {
        if (!(channelIndex in this.channelSections)) {
            this.channelSections[channelIndex] = [{ start: this.stream.offset, end: this.stream.offset }];
        }
        const sections = this.channelSections[channelIndex];
        const lastSection = sections[sections.length - 1];
        if (lastSection.end === this.stream.offset) return lastSection;
        else {
            // create new section (non-contiguous)
            sections.push({ start: this.stream.offset, end: this.stream.offset });
            return sections[sections.length - 1];
        }
    }

    public async getDatabase(): Promise<Database> {
        if (this.minDate === undefined || this.maxDate === undefined) throw new Error("No messages processed");

        const { dateKeys, monthKeys, yearKeys } = genTimeKeys(this.minDate, this.maxDate);
        const { newWords, newWordsMapping } = this.filterWords();
        const { authorsOrder, authorsBotCutoff } = this.sortAuthors();

        progress.new("Compacting messages data");
        // how many bits are needed to store n (n > 0)
        const numBitsFor = (n: number) => (n === 0 ? 1 : 32 - Math.clz32(n));
        const finalStream = new BitStream();
        const finalBitConfig: MessageBitConfig = {
            dayBits: Math.max(1, numBitsFor(dateKeys.length)),
            authorIdxBits: Math.max(1, numBitsFor(this.authors.size)),
            wordIdxBits: Math.max(1, numBitsFor(newWords.length)),
            emojiIdxBits: Math.max(1, numBitsFor(this.emojis.size)),
            mentionsIdxBits: Math.max(1, numBitsFor(this.mentions.size)),
            domainsIdxBits: Math.max(1, numBitsFor(this.domains.size)),
        };
        let messagesWritten = 0;
        for (const channelIndex in this.channelSections) {
            this.channels.data[channelIndex].msgAddr = finalStream.offset;
            for (const section of this.channelSections[channelIndex]) {
                // seek
                this.stream.offset = section.start;
                while (this.stream.offset < section.end) {
                    const msg = readMessage(this.stream, DefaultBitConfig);

                    msg.day = dateKeys.indexOf(Day.fromBinary(msg.day).dateKey);

                    // remap words
                    if (msg.words) {
                        const oldWords = msg.words;
                        msg.words = []; // empty words
                        for (const word of oldWords) {
                            const wordIdx = word[0];

                            if (newWordsMapping[wordIdx] >= 0) {
                                // push new mapping
                                msg.words.push([newWordsMapping[wordIdx], word[1]]);
                            }
                        }
                    }

                    // write final message
                    writeMessage(msg, finalStream, finalBitConfig);
                    progress.progress("number", messagesWritten++, this.totalMessages);
                    this.channels.data[channelIndex].msgCount!++;
                }
            }
        }
        progress.done();

        // console.log("size", finalStream.offset / 8, "bytes", prettyBytes(finalStream.offset / 8));

        // overwrite name for DM channels
        for (const channel of this.channels.data) {
            if (channel.type === "dm") {
                channel.name = channel.dmAuthorIndexes!.map((i) => this.authors.get(i).n).join(" & ");
            }
        }

        return {
            config: this.config,
            bitConfig: finalBitConfig,

            title: this.buildTitle(),

            time: {
                minDate: this.minDate.dateKey,
                maxDate: this.maxDate.dateKey,
                numDays: dateKeys.length,
                numMonths: monthKeys.length,
                numYears: yearKeys.length,
            },
            guilds: this.guilds.data,
            channels: this.channels.data,
            authors: this.authors.data,
            words: newWords,
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
        authorsOrder: Index[];
        authorsBotCutoff: number;
    } {
        progress.new("Sorting authors");
        const authorsOrder: Index[] = Array.from({ length: this.authors.size }, (_, i) => i);
        authorsOrder.sort((a, b) =>
            // first non-bots, then by messages count
            this.authors.data[a].b === this.authors.data[b].b
                ? (this.authorMessagesCount[b] || 0) - (this.authorMessagesCount[a] || 0)
                : +(this.authors.data[a].b || false) - +(this.authors.data[b].b || false)
        );
        const authorsBotCutoff: number = authorsOrder.findIndex((i) => this.authors.data[i].b);

        // only keep the user avatar of the 1000 most active authors
        // to save space (picture URLs are very big)
        for (let i = 1000; i < authorsOrder.length; i++) {
            this.authors.data[authorsOrder[i]].da = undefined;
        }

        progress.done();
        return { authorsOrder, authorsBotCutoff };
    }

    private filterWords(): {
        newWords: string[];
        newWordsMapping: number[];
    } {
        const len = this.words.size;

        // filter words in case we have too many
        if (len > 100000) {
            const newWords: string[] = [];
            const newWordsMapping: number[] = new Array(len).fill(-1);

            progress.new("Filtering words");
            for (let i = 0; i < len; i++) {
                // we will keep the word if it has been said at least twice
                if (this.wordsCount[i] >= 2) {
                    newWordsMapping[i] = newWords.length;
                    newWords.push(this.words.data[i]);
                }
                progress.progress("number", i, len);
            }
            progress.done();

            // NOTE: I tried sorting alphabetically to improve compression, but it was worse

            return { newWords, newWordsMapping };
        } else {
            const newWords = this.words.data;
            const newWordsMapping = Array(len)
                .fill(0)
                .map((_, i) => i);
            return { newWords, newWordsMapping };
        }
    }

    private buildTitle(): string {
        // See report/components/Title.tsx

        if (this.config.platform === "discord") {
            if (this.guilds.size === 1) {
                const guild = this.guilds.data[0];

                if (guild.name === "Direct Messages") {
                    if (this.channels.size === 1) {
                        return this.channels.data[0].name;
                    } else {
                        const allDMs = this.channels.data.every((c) => c.type === "dm");
                        const allGroups = this.channels.data.every((c) => c.type === "group");

                        if (allDMs) {
                            return "Discord DMs";
                        } else if (allGroups) {
                            return "Discord Groups";
                        } else {
                            return "Discord Chats";
                        }
                    }
                } else {
                    return guild.name;
                }
            } else {
                const hasDMs = this.guilds.data.some((g) => g.name === "Direct Messages");

                return hasDMs ? "Discord Servers and DMs" : "Discord Servers";
            }
        } else {
            // We assume there is always only one guild.

            if (this.channels.size === 1) {
                return this.channels.data[0].name;
            } else {
                return this.guilds.data[0].name;
            }
        }

        return "Chats";
    }
}
