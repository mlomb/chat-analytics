export type ID = string;

export type Platform = "discord" | "telegram" | "whatsapp";

export type DiscordAuthor = {
    discriminator: 0 | 1 | 2 | 3 | 4;
};

export type Author = {
    id: ID;
    name: string;
    bot: boolean;
    avatarUrl?: string;
    color?: string;

    discord?: DiscordAuthor;
};

// join chat, etc
export type Event = {
    type: "event";
};

export type Message = {
    type: "message";
    channel?: Channel;
    author: ID;
    reply_to?: Message;
    date: Date;
    content: string;

    // TODO: emails, metions
};

export type Channel = {
    id: ID;
    name: string;
    messages: Message[];
};

export type Database = {
    platform: Platform;
    title: string;
    authors: Map<ID, Author>;
    channels: Channel[];
};
