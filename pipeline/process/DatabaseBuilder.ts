import { Database, IAuthor, IChannel, ID, IMessage, Platform, RawID, ReportConfig } from "@pipeline/Types";
import IDMapper from "@pipeline/parse/IDMapper";

// TODO: !
const searchFormat = (x: string) => x;

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

    protected authorIDMapper = new IDMapper();
    protected channelIDMapper = new IDMapper();

    public addChannel(rawId: RawID, channel: IChannel): ID {
        const id = this.channelIDMapper.get(rawId);
        this.db.channels[id] = {
            ...channel,
            ns: searchFormat(channel.n),
            msgAddr: 0,
            msgCount: 0,
        };
        return id;
    }

    public addAuthor(rawId: RawID, author: IAuthor): ID {
        const id = this.authorIDMapper.get(rawId);
        this.db.authors[id] = {
            ...author,
            ns: searchFormat(author.n),
        };
        return id;
    }

    public addMessage(rawId: RawID, message: IMessage): ID {
        const channel = this.db.channels[message.channelId];
        channel.msgCount += 1;
        return 0;
    }

    public setTitle(title: string) {
        this.db.title = title;
    }

    public getDatabase(): Database {
        this.db.serialized = new Uint8Array(16);
        return this.db;
    }
}
