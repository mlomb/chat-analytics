import { ReportConfig } from "@pipeline/Types";
import { PAuthor, PChannel, PGuild, PMessage } from "@pipeline/parse/Types";

/** A group of messages that belong to the same author, in the same channel, in chronological order */
export type PMessageGroup = PMessage[];

export type Guild = PGuild;
export type Channel = PChannel;
export type Author = PAuthor;
export type Message = PMessage;

export interface Database {
    config: ReportConfig;
    title: string;

    guild: Guild[];
    channel: Channel[];
    author: Author[];
    messages: Message[];
}
