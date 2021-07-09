type ID = string | number;

export type Platform = 'discord' | 'telegram' | 'whatsapp';

export type Author = {
    id: ID;
    name: string;
};

// join chat, etc
export type Event = {
    type: "event";
}

export type Message = {
    id?: ID;
    type: "message";
    channel?: Channel;
    from?: Author;
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
    authors: Author[];
    channels: Channel[];
};
