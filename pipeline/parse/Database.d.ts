/*
This is the common interface generated after parsing

It doesnt need to be trivally serializable because it will be consumed by the preprocess step
*/

import { ID, Timestamp } from "@pipeline/Types";

export interface Database {
    platform: Platform;
    title: string;
    authors: Author[];
    channels: Channel[];
    messages: {
        [channelId: ID]: Message[];
    };
    minDate: Timestamp;
    maxDate: Timestamp;
}

export interface DiscordAuthor {
    discriminator: 0 | 1 | 2 | 3 | 4;
}

export interface Author {
    name: string;
    bot: boolean;
    avatarUrl?: string;
    color?: string;

    discord?: DiscordAuthor;
}

export interface Channel {
    name: string;
}

// join chat, etc
export interface Event {
    type: "event";
}

export interface Message {
    authorId: ID;
    content: string;
    timestamp: Timestamp;
    replyToId?: ID;

    // TODO: emails, metions
}
