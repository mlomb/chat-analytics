import { AttachmentType } from "@pipeline/Attachments";
import { ChannelType, Timestamp } from "@pipeline/Types";

// The following interfaces are emitted by the parsers
// They should be general enough to support all possible chat platforms
// At the same time they should be as basic as possible and not include any platform-specific data

/** Plaform's own ID (e.g: a Discord Snowflake) */
export type RawID = string | number;

/** Guild interface produced by parsers */
export interface PGuild {
    id: RawID;
    name: string;
    avatar?: string;
}

/** Channel interface produced by parsers */
export interface PChannel {
    id: RawID;
    guildId: RawID;
    name: string;
    type: ChannelType;
    avatar?: string;
}

/** Author interface produced by parsers */
export interface PAuthor {
    id: RawID;
    name: string;
    bot: boolean;
    avatar?: string;
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

/** Call interface produced by parsers */
export interface PCall {
    id: RawID;
    authorId: RawID; // the user who started the call
    channelId: RawID;
    timestampStart: Timestamp;
    timestampEnd: Timestamp;
}

/** Emoji interface produced by parsers */
export interface PEmoji {
    id?: RawID; // if available
    text: string; // e.g. "🔥", "pepe", "pepe_sad"
}
