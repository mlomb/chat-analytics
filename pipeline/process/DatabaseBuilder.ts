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
} from "@pipeline/Types";
import IDMapper from "@pipeline/parse/IDMapper";
import { progress } from "@pipeline/Progress";

import { FastTextModel, loadFastTextModel } from "@pipeline/process/FastText";

// TODO: !
const searchFormat = (x: string) => x.toLocaleLowerCase();
const monthToString = (date: Date): string => date.getFullYear() + "-" + (date.getMonth() + 1);
const dateToString = (date: Date): string => monthToString(date) + "-" + date.getDate();

export class DatabaseBuilder {
    private authorIDMapper = new IDMapper();
    private channelIDMapper = new IDMapper();
    private messageQueue: IMessage[] = [];
    private title: string = "Chat";
    private authors: Author[] = [];
    private authorMessagesCount: number[] = [];
    private channels: Channel[] = [];
    private minDate: Timestamp = 0;
    private maxDate: Timestamp = 0;

    constructor(private readonly config: ReportConfig) {}

    private languageDetectorModel: FastTextModel | undefined;

    public async init() {
        if (this.languageDetectorModel === undefined) {
            this.languageDetectorModel = await loadFastTextModel("lid.176");
        }
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

    private labels: any = {};

    // Process messages in the queue
    public async process(force: boolean = false) {
        if (!this.languageDetectorModel) throw new Error("Language detector model not loaded");

        for (const msg of this.messageQueue) {
            const pred: [number, string][] = this.languageDetectorModel.predict(msg.content, 1, 0.0);
            console.assert(pred.length === 1);
            this.labels[pred[0][1]] = (this.labels[pred[0][1]] || 0) + 1;

            const channel = this.channels[msg.channelId];
            channel.msgCount += 1;

            this.authorMessagesCount[msg.authorId] += 1;

            if (this.minDate === 0 || msg.timestamp < this.minDate) this.minDate = msg.timestamp;
            if (this.maxDate === 0 || msg.timestamp > this.maxDate) this.maxDate = msg.timestamp;
        }
        this.messageQueue = [];

        progress.stat(
            "messages",
            this.channels.reduce((sum, c) => sum + c.msgCount, 0)
        );
        if (force) {
            // @ts-ignore
            console.log(Object.entries(this.labels).sort((a, b) => b[1] - a[1]));
        }
    }

    public setTitle(title: string) {
        this.title = title;
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

        return {
            config: this.config,
            title: this.title,
            time: {
                minDate: dateToString(start),
                maxDate: dateToString(end),
                numDays: dayKeys.length,
                numMonths: monthKeys.length,
            },
            channels: this.channels,
            authors: this.authors,
            authorsOrder,
            authorsBotCutoff,
            serialized: new Uint8Array(16),
        };
    }
}
