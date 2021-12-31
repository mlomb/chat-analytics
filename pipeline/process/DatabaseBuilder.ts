import { Database, IAuthor, IChannel, ID, IMessage, Platform, RawID, ReportConfig } from "@pipeline/Types";
import IDMapper from "@pipeline/parse/IDMapper";
import { progress } from "@pipeline/Progress";

import { FastTextModel, loadFastTextModel } from "@pipeline/process/FastText";

// TODO: !
const searchFormat = (x: string) => x.toLocaleLowerCase();

export class DatabaseBuilder {
    private db: Database = {
        config: this.config,
        title: "Chat",
        time: {
            minDate: "",
            maxDate: "",
            numDays: 0,
            numMonths: 0,
        },
        channels: [],
        authors: [],
    };

    constructor(private readonly config: ReportConfig) {}

    private languageDetectorModel: FastTextModel | undefined;

    public async init() {
        if (this.languageDetectorModel === undefined) {
            this.languageDetectorModel = await loadFastTextModel("lid.176");
        }
    }

    private authorIDMapper = new IDMapper();
    private channelIDMapper = new IDMapper();
    private messageQueue: IMessage[] = [];

    public addChannel(rawId: RawID, channel: IChannel): ID {
        const [id, _new] = this.channelIDMapper.get(rawId);
        if (_new) {
            this.db.channels[id] = {
                ...channel,
                ns: searchFormat(channel.n),
                msgAddr: 0,
                msgCount: 0,
            };
            progress.stat("channels", this.db.channels.length);
        }
        return id;
    }

    public addAuthor(rawId: RawID, author: IAuthor): ID {
        const [id, _new] = this.authorIDMapper.get(rawId);
        if (_new) {
            this.db.authors[id] = {
                ...author,
                ns: searchFormat(author.n),
            };
            progress.stat("authors", this.db.authors.length);
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

        for (const message of this.messageQueue) {
            const pred: [number, string][] = this.languageDetectorModel.predict(message.content, 1, 0.0);
            console.assert(pred.length === 1);
            this.labels[pred[0][1]] = (this.labels[pred[0][1]] || 0) + 1;

            const channel = this.db.channels[message.channelId];
            channel.msgCount += 1;
        }
        this.messageQueue = [];

        progress.stat(
            "messages",
            this.db.channels.reduce((sum, c) => sum + c.msgCount, 0)
        );
        if (force) {
            // @ts-ignore
            console.log(Object.entries(this.labels).sort((a, b) => b[1] - a[1]));
        }
    }

    public setTitle(title: string) {
        this.db.title = title;
    }

    public getDatabase(): Database {
        this.db.serialized = new Uint8Array(16);
        return this.db;
    }
}
