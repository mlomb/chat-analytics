import { AttachmentType } from "@pipeline/Attachments";
import { DateKey } from "@pipeline/Time";
import { ChannelType, Config, Index } from "@pipeline/Types";
import { RawID } from "@pipeline/parse/Types";
import { IndexCounts } from "@pipeline/process/IndexCounts";
import { BitAddress } from "@pipeline/serialization/BitStream";
import { MessageBitConfig } from "@pipeline/serialization/MessageSerialization";

/** All the information processed */
export interface Database {
    config: Config;
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

    /** Messages are serialized and must be read using `readMessage` or the `MessageView` class */
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

// names are shortened to bytes during JSON serialization ReportWorker → UI (can add quickly with 300k members)
export interface Author {
    /** name */
    n: string;
    /** bot */
    b?: undefined | true;
    /** avatar */
    a?: string;
}

export interface Message {
    // time
    dayIndex: number;
    secondOfDay: number;

    // author
    authorIndex: Index;

    // reply
    replyOffset?: number;

    // analysis
    langIndex?: Index;
    sentiment?: number;

    // content
    words?: IndexCounts;
    emojis?: IndexCounts;
    mentions?: IndexCounts;
    reactions?: IndexCounts;
    domains?: IndexCounts;
    attachments?: IndexCounts<AttachmentType>;
}

/** Esentially a Message but with extra information needed in the UI */
export interface MessageComplete extends Message {
    guildIndex: Index;
    channelIndex: Index;
}

// TODO: change to CustomEmoji | UnicodeEmoji ?
export interface Emoji {
    /** Platform's emoji ID (if custom and available)  */
    id?: RawID;
    /** Name of the emoji ("fire" or "custom_emoji") */
    name: string;
    /** Unicode symbol (e.g. 🔥) (not for custom emojis) */
    symbol?: string;
}
