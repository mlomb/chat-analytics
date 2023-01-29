import { AttachmentType } from "@pipeline/Attachments";
import { DateKey } from "@pipeline/Time";
import { BitAddress, ChannelType, Index, RawID, ReportConfig } from "@pipeline/Types";
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
    messages?: Uint8Array;

    emojis: Emoji[];
    words: string[];
    mentions: string[];
    domains: string[];

    // eventually we want to remove the following fields
    authorsOrder: number[];
    authorsBotCutoff: number;
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
    words?: [Index, number][];
    emojis?: [Index, number][];
    mentions?: [Index, number][];
    reactions?: [Index, number][];
    domains?: [Index, number][];
    attachments?: [AttachmentType, number][];
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
