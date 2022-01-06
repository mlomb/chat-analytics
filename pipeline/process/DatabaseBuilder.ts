import {
    Author,
    BitAddress,
    Channel,
    Database,
    IAuthor,
    IChannel,
    ID,
    IMessage,
    IntermediateMessage,
    Message,
    RawID,
    ReportConfig,
    Timestamp,
    Word,
    WordIndex,
} from "@pipeline/Types";
import IDMapper from "@pipeline/parse/IDMapper";
import { progress } from "@pipeline/Progress";
import { LanguageDetector } from "@pipeline/process/LanguageDetection";
import { stripDiacritics } from "@pipeline/process/Diacritics";
import { BitStream } from "@pipeline/report/BitStream";
import { dateToString, monthToString } from "@pipeline/Util";
import {
    MessageBitConfig,
    readIntermediateMessage,
    writeIntermediateMessage,
    writeMessage,
} from "@pipeline/report/Serialization";

import Tokenizer from "wink-tokenizer";

// TODO: !
const searchFormat = (x: string) => x.toLocaleLowerCase();

// how many bits are needed to store n
// n > 0
const nextPOTBits = (n: number) => 32 - Math.clz32(n);

// section in the bitstream
type ChannelSection = {
    ts: Timestamp;
    start: BitAddress;
    end: BitAddress;
};

export class DatabaseBuilder {
    private authorIDMapper = new IDMapper();
    private channelIDMapper = new IDMapper();
    private messageQueue: IMessage[] = [];
    private title: string = "Chat";
    private words: Word[] = [];
    private wordsIDs: Map<Word, ID> = new Map();
    private wordsCount: number[] = [];
    private authors: Author[] = [];
    private authorMessagesCount: number[] = [];
    private channels: Channel[] = [];
    private minDate: Timestamp = 0;
    private maxDate: Timestamp = 0;
    private stream: BitStream;
    private channelSections: { [id: ID]: ChannelSection[] } = {};
    private totalMessages = 0;

    private languageDetector: LanguageDetector;
    private tokenizer: Tokenizer;

    constructor(private readonly config: ReportConfig) {
        this.stream = new BitStream();
        this.languageDetector = new LanguageDetector();
        this.tokenizer = new Tokenizer();
        this.tokenizer.defineConfig({
            quoted_phrase: false,
            time: false,
        });
    }

    public async init() {
        await this.languageDetector.init();
    }

    public setTitle(title: string) {
        this.title = title;
    }

    public addChannel(rawId: RawID, channel: IChannel): ID {
        const [id, _new] = this.channelIDMapper.get(rawId);
        if (_new) {
            this.channels[id] = {
                ...channel,
                ns: searchFormat(channel.n),
                msgAddr: 0,
                msgCount: 0,
            };
            progress.stat("channels", this.channels.length);
        }
        return id;
    }

    public addAuthor(rawId: RawID, author: IAuthor): ID {
        const [id, _new] = this.authorIDMapper.get(rawId);
        if (_new) {
            this.authors[id] = {
                ...author,
                ns: searchFormat(author.n),
            };
            this.authorMessagesCount[id] = 0;
            progress.stat("authors", this.authors.length);
        }
        return id;
    }

    public addMessage(message: IMessage) {
        this.messageQueue.push(message);
    }

    private getChannelSection(channelId: ID, timestamp: Timestamp): ChannelSection {
        if (!(channelId in this.channelSections)) {
            this.channelSections[channelId] = [
                {
                    ts: timestamp,
                    start: this.stream.offset,
                    end: this.stream.offset,
                },
            ];
        }
        const sections = this.channelSections[channelId];
        const lastSection = sections[sections.length - 1];
        if (lastSection.end === this.stream.offset) return lastSection;
        else {
            // create new section (non-contiguous)
            sections.push({
                ts: timestamp,
                start: this.stream.offset,
                end: this.stream.offset,
            });
            return sections[sections.length - 1];
        }
    }

    // Process messages in the queue
    public async process(force: boolean = false) {
        if (this.messageQueue.length === 0) return;
        const section = this.getChannelSection(this.messageQueue[0].channelId, this.messageQueue[0].timestamp);

        for (const msg of this.messageQueue) {
            const rawDate = new Date(msg.timestamp);
            const tsUTC = Date.UTC(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate());
            const dateUTC = new Date(tsUTC);

            if (this.minDate === 0 || tsUTC < this.minDate) this.minDate = tsUTC;
            if (this.maxDate === 0 || tsUTC > this.maxDate) this.maxDate = tsUTC;
            this.authorMessagesCount[msg.authorId] += 1;
            this.channels[msg.channelId].msgCount += 1;

            const langIdx = Math.floor(Math.random() * 176); //this.languageDetector.detect(msg.content);
            const sentiment = Math.floor(Math.random() * 176);
            // TODO: use different tokenizers depending on language
            // TODO: https://github.com/marcellobarile/multilang-sentiment
            const tokens = this.tokenizer.tokenize(msg.content);
            // console.log(msg.content, langIdx, tokens);

            const wordsCount: { [word: Word]: number } = {};
            for (const token of tokens) {
                let word: Word | undefined = undefined;
                if (token.tag === "word") {
                    const tagClean = stripDiacritics(token.value.toLocaleLowerCase());
                    if (tagClean.length > 1 && tagClean.length < 25) {
                        // MAX 25 chars per word
                        word = tagClean;
                    }
                } else if (token.tag === "emoji") {
                    word = token.value;
                }
                if (word) {
                    wordsCount[word] = (wordsCount[word] || 0) + 1;
                }
            }

            const imsg: IntermediateMessage = {
                year: dateUTC.getFullYear(),
                month: dateUTC.getMonth(),
                day: dateUTC.getDate(),
                hour: dateUTC.getHours(),
                authorId: msg.authorId,
                langIdx,
                sentiment,
                words: [],
            };

            const words = Object.keys(wordsCount);
            const numWords = Math.min(words.length, 255); // MAX 255 words per message
            for (let i = 0; i < numWords; i++) {
                const wordIdx = this.getWord(words[i]);
                const count = Math.min(wordsCount[words[i]], 15);
                this.wordsCount[wordIdx] = (this.wordsCount[wordIdx] || 0) + count;
                imsg.words.push([wordIdx, count]); // MAX 15 occurrences per word
            }

            // store message
            writeIntermediateMessage(imsg, this.stream);
            this.totalMessages += 1;

            // register in section
            section.end = this.stream.offset;
        }
        this.messageQueue = [];

        progress.stat(
            "messages",
            this.channels.reduce((sum, c) => sum + c.msgCount, 0)
        );
    }

    private getWord(word: Word): ID {
        const id = this.wordsIDs.get(word);
        if (id) return id;
        this.wordsIDs.set(word, this.words.length);
        this.words.push(word);
        return this.words.length - 1;
    }

    public getDatabase(): Database {
        const start = new Date(this.minDate);
        const end = new Date(this.maxDate);
        const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());

        const dayKeys: string[] = [];
        const monthKeys: string[] = [];

        for (let day = new Date(startUTC); day <= end; day.setDate(day.getDate() + 1)) {
            const dayKey = dateToString(day);
            const monthKey = monthToString(day);

            dayKeys.push(dayKey);
            if (monthKeys.length === 0 || monthKeys[monthKeys.length - 1] !== monthKey) monthKeys.push(monthKey);
        }

        progress.new("Sorting authors");
        const authorsOrder: ID[] = Array.from({ length: this.authors.length }, (_, i) => i);
        authorsOrder.sort((a, b) =>
            // first non-bots, then by messages count
            this.authors[a].b === this.authors[b].b
                ? this.authorMessagesCount[b] - this.authorMessagesCount[a]
                : +this.authors[a].b - +this.authors[b].b
        );
        const authorsBotCutoff: number = authorsOrder.findIndex((i) => this.authors[i].b);
        progress.done();

        progress.new("Computing words cutoff");
        const wordsCutoff = this.computeWordsCutoff();
        console.log("Words cutoff", wordsCutoff);
        progress.done();

        console.log("original", Math.ceil(this.stream.offset / 8));
        console.time("buff");
        progress.new("Generating final messages data");
        const bitConfig: MessageBitConfig = {
            dayIndexBits: Math.max(1, nextPOTBits(dayKeys.length)),
            authorIdBits: Math.max(1, nextPOTBits(this.authors.length)),
            wordIdxBits: Math.max(1, nextPOTBits(this.words.length)),
        };
        const finalStream = new BitStream();
        let messagesWritten = 0;
        for (const channelId in this.channelSections) {
            this.channels[channelId].msgAddr = finalStream.offset;
            for (const section of this.channelSections[channelId]) {
                // seek
                this.stream.offset = section.start;
                while (this.stream.offset < section.end) {
                    const imsg = readIntermediateMessage(this.stream);

                    const msg: Message = {
                        dayIndex: dayKeys.indexOf(`${imsg.year}-${imsg.month}-${imsg.day}`),
                        hour: imsg.hour,
                        authorId: imsg.authorId,
                        langIdx: imsg.langIdx,
                        sentiment: imsg.sentiment,
                        words: [],
                    };

                    // filter words
                    for (let i = 0; i < imsg.words.length; i++) {
                        const pair = imsg.words[i];
                        if (this.wordsCount[pair[0]] >= wordsCutoff) {
                            msg.words.push(pair);
                        }
                    }

                    // write message
                    writeMessage(msg, finalStream, bitConfig);
                    this.channels[channelId].msgCount++;
                    progress.progress("number", messagesWritten++, this.totalMessages);
                }
            }
        }
        progress.done();
        console.timeEnd("buff");
        console.log("final", Math.ceil(finalStream.offset / 8));
        debugger;
        return {
            config: this.config,
            bitConfig,
            title: this.title,
            time: {
                minDate: dateToString(start),
                maxDate: dateToString(end),
                numDays: dayKeys.length,
                numMonths: monthKeys.length,
            },
            words: this.words,
            channels: this.channels,
            authors: this.authors,
            authorsOrder,
            authorsBotCutoff,
            serialized: finalStream.buffer.slice(0, Math.ceil(finalStream.offset / 8)),
        };
    }

    computeWordsCutoff(): number {
        const sortedCounts = this.wordsCount.slice(0).sort((a, b) => b - a);
        const total = sortedCounts.reduce((sum, c) => sum + c, 0);
        const threshold = total * 0.95;
        const len = sortedCounts.length;
        let i = 0,
            acc = 0;
        for (; i < len; i++) {
            acc += sortedCounts[i];
            if (acc >= threshold) break;
            progress.progress("number", acc, threshold);
        }
        // at least two occurrences
        return Math.max(2, sortedCounts[i] || 0);
    }
}
