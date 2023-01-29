import { AttachmentType } from "@pipeline/Attachments";
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
    timestampEdit?: Timestamp;
    replyTo?: RawID;

    textContent?: string;
    attachments?: AttachmentType[];
    reactions?: [PEmoji, number][];
}

/** Emoji interface produced by parsers (for custom emojis) */
export interface PEmoji {
    id?: RawID; // if available
    name: string; // e.g. "pepe", "pepe_sad"
}
