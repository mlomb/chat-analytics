import { ID, Timestamp, Platform, FileInput, StepInfo } from "@pipeline/Types";
import { Database, Author, Channel, Message } from "@pipeline/parse/Database";

export abstract class Parser {
    public database: Database = {
        platform: this.platform,
        title: "Chat",
        authors: new Map(),
        channels: new Map(),
        messages: {},
    };

    constructor(private readonly platform: Platform) {}

    abstract parse(file: FileInput): AsyncGenerator<StepInfo>;

    protected addChannel(channel: Channel) {
        this.database.channels.set(channel.id, channel);
    }

    protected addAuthor(author: Author) {
        this.database.authors.set(author.id, author);
    }

    protected addMessage(message: Message) {
        if (!(message.channelId in this.database.messages)) {
            this.database.messages[message.channelId] = [message];
        } else {
            this.database.messages[message.channelId].push(message);
        }
    }

    protected updateTitle(title: string): void {
        this.database.title = title;
    }
}
