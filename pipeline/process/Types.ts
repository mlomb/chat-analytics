import { DateKey } from "@pipeline/Time";
import { AttachmentType, BitAddress, ChannelType, Emoji, Index, RawID, ReportConfig } from "@pipeline/Types";
import { PMessage } from "@pipeline/parse/Types";
import { MessageBitConfig } from "@pipeline/serialization/MessageSerialization";

export type IMessage = PMessage;

export interface Database {
    config: ReportConfig;
    title: string;

    time: {
        minDate: DateKey;
        maxDate: DateKey;

        // useful to know bucket sizes
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

    // we want to eventually remove the following fields
    authorsOrder: number[];
    authorsBotCutoff: number;
    bitConfig: MessageBitConfig;
    serialized?: Uint8Array;
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
