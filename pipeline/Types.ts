import { MessageBitConfig } from "@pipeline/serialization/MessageSerialization";
import { DateKey } from "@pipeline/Time";

// raw ID that comes from the platform (e.g: 9876554321)
export type RawID = string | number;

// a zero-based index
export type Index = number;

// offset in BITS in a BitStream
export type BitAddress = number;

// UTC timestamp
export type Timestamp = number;

// available platforms
export type Platform = "discord" | "messenger" | "telegram" | "whatsapp";

export enum AttachmentType {
    Image,
    ImageAnimated, // (GIFs)
    Video,
    Sticker,
    Audio,
    Document,
    Other,
}

// dm: direct message between TWO users
// group: direct message between MORE THAN TWO users
// text: generic text channel
export type ChannelType = "dm" | "group" | "text";

// configuration, set in the UI
export interface ReportConfig {
    platform: Platform;
}

// the generated object after processing
export interface Database {
    config: ReportConfig;
    bitConfig: MessageBitConfig;

    title: string;

    time: {
        minDate: DateKey;
        maxDate: DateKey;
        numDays: number;
        numMonths: number;
        numYears: number;
    };

    guilds: Guild[];
    channels: Channel[];
    authors: Author[];
    words: string[];
    emojis: Emoji[];
    mentions: string[];
    domains: string[];

    authorsOrder: number[];
    authorsBotCutoff: number;

    serialized?: SerializedData;
}

// additional serialized data (like messages)
export type SerializedData = Uint8Array;

/*
    Some names are short to reduce the size when it's transferred from the Worker to the main thread
    It does not help with compression
*/

export interface Guild {
    name: string;
    iconUrl?: string;
}

export interface Channel {
    name: string;
    type: ChannelType;
    guildIndex: Index;
    dmAuthorIndexes?: Index[];
    discordId?: RawID;

    // messages location
    msgAddr?: BitAddress;
    msgCount?: number;
}

export interface Author {
    // name
    n: string;
    // bot
    b?: undefined | true;
    // Discord discriminant (#XXXX)
    d?: number;
    // Discord avatar (user_id/user_avatar)
    da?: string;
}

export interface Emoji {
    // name ("fire" or "custom_emoji")
    n: string;
    // character (🔥)
    c?: string;
    // Discord emoji ID (if custom and available)
    id?: RawID;
}

// emitted by parsers
export interface IMessage {
    id: RawID;
    replyTo?: RawID;
    authorIndex: Index;
    channelIndex: Index;
    timestamp: Timestamp;
    timestampEdit?: Timestamp;
    content?: string;
    attachments: AttachmentType[];
    reactions: [Emoji, number][];
}

// stored serialized during generation
export interface Message {
    day: number;
    secondOfDay: number;
    authorIndex: Index;
    replyOffset?: number;
    langIndex?: Index;
    sentiment?: number;
    words?: [Index, number][];
    emojis?: [Index, number][];
    mentions?: [Index, number][];
    reactions?: [Index, number][];
    domains?: [Index, number][];
    attachments?: [AttachmentType, number][];
}

// used in the UI, basically a Message but with the channel
export interface FullMessage extends Message {
    channelIndex: Index;
}

// used in the UI to cache the format of common objects (mostly for searching)
export interface FormatCache {
    authors: string[];
    channels: string[];
    words: string[];
    emojis: string[];
    mentions: string[];
}
