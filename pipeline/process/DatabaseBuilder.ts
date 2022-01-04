import {
    Author,
    Channel,
    Database,
    IAuthor,
    IChannel,
    ID,
    IMessage,
    RawID,
    ReportConfig,
    Timestamp,
    Word,
} from "@pipeline/Types";
import IDMapper from "@pipeline/parse/IDMapper";
import { progress } from "@pipeline/Progress";
import { LanguageDetector } from "@pipeline/process/LanguageDetection";
import { stripDiacritics } from "@pipeline/process/Diacritics";
import { Serializer } from "@pipeline/report/Serializer";
import { dateToString, monthToString } from "@pipeline/Util";

import Tokenizer from "wink-tokenizer";

// TODO: !
const searchFormat = (x: string) => x.toLocaleLowerCase();

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
    private channelBuffers: {
        [id: ID]: {
            start: Timestamp;
            end: Timestamp;
            data: Serializer;
        }[];
    } = {};

    private languageDetector: LanguageDetector;
    private tokenizer: Tokenizer;

    constructor(private readonly config: ReportConfig) {
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

    private test: {
        [day: string]: {
            [authorId: ID]: {
                [word: number]: number;
            };
        };
    } = {};

    private c: number = 0;

    // Process messages in the queue
    public async process(force: boolean = false) {
        for (const msg of this.messageQueue) {
            const serializer = this.getChannelSerializer(msg.channelId, msg.timestamp);
            if (!serializer) continue; // already processed (by time bounds)

            if (this.minDate === 0 || msg.timestamp < this.minDate) this.minDate = msg.timestamp;
            if (this.maxDate === 0 || msg.timestamp > this.maxDate) this.maxDate = msg.timestamp;
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

            const d = dateToString(new Date(msg.timestamp));
            if (!(d in this.test)) this.test[d] = {};
            const day = this.test[d];
            if (!(msg.authorId in day)) day[msg.authorId] = {};
            const author = day[msg.authorId];
            for (const [word, count] of Object.entries(wordsCount)) {
                const wordIdx = this.getWord(word);
                if (!(wordIdx in author)) author[wordIdx] = 0;
                author[wordIdx] += count;
                this.wordsCount[wordIdx] = (this.wordsCount[wordIdx] || 0) + count;
            }

            this.c += 32;
            this.c += 24;
            this.c += 8;
            this.c += 8;
            this.c += Object.keys(wordsCount).length * 24;

            serializer.writeUint32(msg.timestamp);
            serializer.writeUint24(msg.authorId);
            serializer.writeUint8(langIdx);
            serializer.writeUint8(sentiment);
            let words = Object.keys(wordsCount);
            let numWords = Math.min(words.length, 255); // MAX 256 words per message
            serializer.writeUint8(numWords);
            for (const word of words) {
                if (Math.random() > 0.5) {
                    const wordIdx = this.getWord(word);
                    serializer.writeUint24((wordIdx << 4) | wordsCount[word]);
                }
            }
        }
        this.messageQueue = [];

        progress.stat(
            "messages",
            this.channels.reduce((sum, c) => sum + c.msgCount, 0)
        );
    }

    private getChannelSerializer(channelId: ID, ts: Timestamp): Serializer | undefined {
        // TODO: !
        if (!(channelId in this.channelBuffers)) this.channelBuffers[channelId] = [];
        const arr = this.channelBuffers[channelId];
        if (arr.length === 0) {
            arr.push({
                start: ts,
                end: ts,
                data: new Serializer(),
            });
        }
        return arr[0].data;
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

        console.log(this.test);

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

        progress.new("Merging channel buffers");
        let totalSize = 0;
        for (const channelId in this.channelBuffers) {
            for (const buffer of this.channelBuffers[channelId]) {
                totalSize += buffer.data.length;
            }
        }
        const serialized = new Uint8Array(totalSize);
        let offset = 0;
        for (const channelId in this.channelBuffers) {
            this.channels[channelId].msgAddr = offset;
            for (const buffer of this.channelBuffers[channelId]) {
                serialized.set(buffer.data.validBuffer, offset);
                offset += buffer.data.length;
            }
        }
        console.assert(offset === totalSize);
        progress.done();

        console.log(this.wordsCount);

        let sz = 0;
        for (const day in this.test) {
            sz += 16;
            for (const author in this.test[day]) {
                if (Object.keys(this.test[day][author]).length > 0) {
                    sz += 24; // author id
                    sz += 8; // lang
                    sz += 8; // sentiment
                    for (const word in this.test[day][author]) {
                        if (this.wordsCount[word] > 1) {
                            sz += 24;
                        }
                    }
                }
            }
        }
        console.log("sz", sz / 8);
        console.log("new sz", this.c / 8);
        debugger;
        console.log("szJSON", JSON.stringify(this.test).length);

        debugger;
        return {
            config: this.config,
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
            serialized,
        };
    }
}
