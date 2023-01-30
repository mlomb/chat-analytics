import { AttachmentType } from "@pipeline/Attachments";
import { DateKey } from "@pipeline/Time";
import { BitAddress, ChannelType, Index, RawID, ReportConfig } from "@pipeline/Types";
import { IndexCounts } from "@pipeline/process/IndexCounts";
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

export interface Message {
    day: number;
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

export type IMessage = Message;

// change to CustomEmoji | UnicodeEmoji ?
export interface Emoji {
    // platform's emoji ID (if custom and available)
    id?: RawID;
    // name of the emoji ("fire" or "custom_emoji")
    name: string;
    // unicode symbol (e.g. 🔥) (not for custom emojis)
    symbol?: string;
}
