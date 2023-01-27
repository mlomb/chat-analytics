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
    demo?: boolean;
}

/*
    Some names are short to reduce the size when it's transferred from the Worker to the main thread
    It does not help with compression
*/

export interface Emoji {
    // name ("fire" or "custom_emoji")
    n: string;
    // character (🔥)
    c?: string;
    // Discord emoji ID (if custom and available)
    id?: RawID;
}

// used in the UI to cache the format of common objects (mostly for searching)
export interface FormatCache {
    authors: string[];
    channels: string[];
    words: string[];
    emojis: string[];
    mentions: string[];
}
