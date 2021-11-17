import { ID, Timestamp, Platform } from "@pipeline/Types";
import { Database, Author, Channel, Message } from "@pipeline/parse/Database";

export abstract class Parser {
    public database: Database = {
        platform: this.platform,
        title: "Chat",
        authors: new Map(),
        channels: new Map(),
        messages: {},
    };
    private mostRecent: Map<ID, number> = new Map();
    private messagesPresent: Set<ID> = new Set();

    constructor(private readonly platform: Platform) {}

    abstract parse(file_content: string): void;

    protected addChannel(channel: Channel, timestamp: Timestamp): Channel {
        if (!this.isMoreRecent(channel.id, timestamp)) {
            // return old channel
            return this.database.channels.get(channel.id)!;
        }

        // store new channel
        this.database.channels.set(channel.id, channel);
        this.mostRecent.set(channel.id, timestamp);
        return channel;
    }

    protected addAuthor(author: Author, timestamp: Timestamp): Author {
        if (!this.isMoreRecent(author.id, timestamp)) {
            // return old author
            return this.database.authors.get(author.id)!;
        }

        // store new author
        this.database.authors.set(author.id, author);
        this.mostRecent.set(author.id, timestamp);
        return author;
    }

    protected addMessage(message: Message) {
        if (!this.messagesPresent.has(message.id)) {
            this.messagesPresent.add(message.id);
            if (!(message.channelId in this.database.messages)) {
                this.database.messages[message.channelId] = [];
            }
            this.database.messages[message.channelId].push(message);
        }
    }

    protected updateTitle(title: string, timestamp: Timestamp): void {
        if (this.isMoreRecent("title", timestamp)) {
            this.database.title = title;
        }
    }

    private isMoreRecent(id: ID, timestamp: Timestamp): boolean {
        return timestamp > (this.mostRecent.get(id) || -1);
    }
}
