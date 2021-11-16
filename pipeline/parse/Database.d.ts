/*
    This is the common interface generated after parsing

    It doesnt need to be trivally serializable because it will be consumed by the preprocess step
*/
export interface Database {
    platform: Platform;
    title: string;
    authors: Map<ID, Author>;
    channels: Map<ID, Channel>;
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

// join chat, etc
export interface Event {
    type: "event";
}

export interface Message {
    type: "message";
    channel?: Channel;
    author: ID;
    reply_to?: Message;
    date: Date;
    content: string;

    // TODO: emails, metions
}

export interface Channel {
    id: ID;
    name: string;
    messages: Message[];
}
