/*
This is the common interface generated after parsing

It doesnt need to be trivally serializable because it will be consumed by the preprocess step
*/

import { ID, Timestamp } from "@pipeline/Types";

export interface Database {
    platform: Platform;
    title: string;
    authors: Map<ID, Author>;
    channels: Map<ID, Channel>;
    messages: {
        [channelId: ID]: Message[];
    };
}

export interface DiscordAuthor {
    discriminator: 0 | 1 | 2 | 3 | 4;
}

export interface Author {
    id: ID;
    name: string;
    bot: boolean;
    avatarUrl?: string;
    color?: string;

    discord?: DiscordAuthor;
}

export interface Channel {
    id: ID;
    name: string;
}

// join chat, etc
export interface Event {
    type: "event";
}

export interface Message {
    id: ID;
    channelId: ID;
    authorId: ID;
    content: string;
    timestamp: Timestamp;
    replyToId?: ID;

    // TODO: emails, metions
}
