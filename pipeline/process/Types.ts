import { AttachmentType } from "@pipeline/Attachments";
import { Language } from "@pipeline/Languages";
import { DateKey } from "@pipeline/Time";
import { ChannelType, Config, Index } from "@pipeline/Types";
import { RawID } from "@pipeline/parse/Types";
import { IndexCounts } from "@pipeline/process/IndexCounts";
import { BitAddress } from "@pipeline/serialization/BitStream";
import { MessageBitConfig } from "@pipeline/serialization/MessageSerialization";

/** All the information processed */
export interface Database {
    config: Config;
    generatedAt: string;

    title: string;
    langs: Language[];

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
    calls: Call[];
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

// names are shortened to save bytes during JSON serialization ReportWorker → UI (can add quickly with 300k members)
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
    editedAfter?: number; // seconds

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

/** Essentially a Message but with extra information needed in the UI */
export interface MessageComplete extends Message {
    guildIndex: Index;
    channelIndex: Index;
}

export interface CustomEmoji {
    type: "custom";
    /** Platform's emoji ID (if available)  */
    id?: RawID;
    /** Name of the emoji ("fire" or "custom_emoji") */
    name: string;
}

export interface UnicodeEmoji {
    type: "unicode";
    /** Unicode symbol (e.g. 🔥) */
    symbol: string;
    /** Human name of emoji ("smiling face" or "waving hand sign") */
    name: string;
}

export type Emoji = CustomEmoji | UnicodeEmoji;

export interface Call {
    authorIndex: Index;
    channelIndex: Index;
    start: {
        dayIndex: number;
        secondOfDay: number;
    };
    end: {
        dayIndex: number;
        secondOfDay: number;
    };
    duration: number; // seconds
}
