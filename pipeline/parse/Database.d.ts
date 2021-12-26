/*
This is the common interface generated after parsing

It doesnt need to be trivally serializable because it will be consumed by the preprocess step
*/

import { ID, Platform, Timestamp } from "@pipeline/Types";

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

export interface Author {
    name: string;
    bot: boolean;
    discord?: {
        discriminator: number;
        avatar?: string; // (user_id/user_avatar)
    };
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
