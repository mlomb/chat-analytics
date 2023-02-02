import { AttachmentType } from "@pipeline/Attachments";
import { DateKey } from "@pipeline/Time";
import { ChannelType, Index, RawID, ReportConfig } from "@pipeline/Types";
import { IndexCounts } from "@pipeline/process/IndexCounts";
import { BitAddress } from "@pipeline/serialization/BitStream";
import { MessageBitConfig } from "@pipeline/serialization/MessageSerialization";

// TODO: we want to change all this interfaces
// we are keeping they this way for now to avoid breaking the UI

export interface Database {
    config: ReportConfig;
    title: string;

    time: {
        minDate: DateKey;
        maxDate: DateKey;

        // useful to know bucket sizes in advance
        numDays: number;
        numMonths: number;
        numYears: number;
    };

    guilds: Guild[];
    channels: Channel[];
    authors: Author[];
    emojis: Emoji[];
    words: string[];
    mentions: string[];
    domains: string[];

    messages: Uint8Array;
    numMessages: number;
    bitConfig: MessageBitConfig;
}

export interface Guild {
    name: string;
    avatar?: string;
}

export interface Channel {
    name: string;
    type: ChannelType;
    avatar?: string;
    guildIndex: Index;
    participants?: Index[]; // only included if type === "dm"

    // messages location
    msgAddr?: BitAddress;
    msgCount?: number;
}

export interface Author {
    n: string; // name
    b?: undefined | true; // bot
    a?: string; // avatar
}

export interface Message {
    dayIndex: number;
    secondOfDay: number;
    authorIndex: Index;
    replyOffset?: number;
    langIndex?: Index;
    sentiment?: number;
    words?: IndexCounts;
    emojis?: IndexCounts;
    mentions?: IndexCounts;
    reactions?: IndexCounts;
    domains?: IndexCounts;
    attachments?: IndexCounts<AttachmentType>;
}

// TODO: remove
// used in the UI, basically a Message but with the channel
export interface FullMessage extends Message {
    channelIndex: Index;
}

// change to CustomEmoji | UnicodeEmoji ?
export interface Emoji {
    // platform's emoji ID (if custom and available)
    id?: RawID;
    // name of the emoji ("fire" or "custom_emoji")
    name: string;
    // unicode symbol (e.g. 🔥) (not for custom emojis)
    symbol?: string;
}
