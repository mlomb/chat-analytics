import { ChannelType, RawID, Timestamp } from "@pipeline/Types";

// The following interfaces are emitted by the parsers
// They should be general enough to support all possible chat platforms
// At the same time they should be as basic as possible and not include any platform-specific data

/** Guild interface produced by parsers */
export interface PGuild {
    id: RawID;
    name: string;
    iconUrl?: string;
}

/** Channel interface produced by parsers */
export interface PChannel {
    id: RawID;
    guildId: RawID;
    name: string;
    type: ChannelType;
}

/** Author interface produced by parsers */
export interface PAuthor {
    id: RawID;
    name: string;
    bot: boolean;
}

/** Message interface produced by parsers */
export interface PMessage {
    id: RawID;
    authorId: RawID;
    channelId: RawID;
    timestamp: Timestamp;
    textContent?: string;

    /*
    id: RawID;
    replyTo?: RawID;
    authorIndex: Index;
    channelIndex: Index;
    timestamp: Timestamp;
    timestampEdit?: Timestamp;
    content?: string;
    attachments: AttachmentType[];
    reactions: [Emoji, number][];
    */
}
