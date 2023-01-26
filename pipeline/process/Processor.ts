import { RawID } from "@pipeline/Types";
import { Parser } from "@pipeline/parse/Parser";
import { PAuthor, PChannel, PGuild } from "@pipeline/parse/Types";
import { Store } from "@pipeline/process//Store";
import { ChannelMessageGrouper } from "@pipeline/process/ChannelMessageGrouper";

export class Processor {
    private guilds = new Store<PGuild>();
    private channels = new Store<PChannel>();
    private authors = new Store<PAuthor>();

    private messagesGroupers = new Map<RawID, ChannelMessageGrouper>();

    constructor(parser: Parser) {
        parser.on("guild", (guild, at) => this.guilds.store(guild, at));
        parser.on("channel", (channel, at) => this.channels.store(channel, at));
        parser.on("author", (author, at) => this.authors.store(author, at));
        parser.on("message", (message, at) => {
            if (!this.messagesGroupers.has(message.channelId))
                this.messagesGroupers.set(message.channelId, new ChannelMessageGrouper());
            this.messagesGroupers.get(message.channelId)?.pushMessages([message]);
        });
    }

    process() {
        console.log("Processing...");

        for (const grouper of this.messagesGroupers.values()) {
            for (const group of grouper.extractGroups()) {
                console.log(group);
            }
        }
    }
}
