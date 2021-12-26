/*
This is the interface generated after preprocessing

It needs to be trivally serializable because it will be stored in the report file
*/

import { Address, Platform, ReportConfig } from "@pipeline/Types";

type ID = number;
type DateStr = string; // YYYY-MM-DD

export interface ReportData {
    config: ReportConfig;
    title: string;
    time: {
        minDate: DateStr;
        maxDate: DateStr;
        numDays: number;
        numMonths: number;
    };

    channels: Channel[];
    authors: Author[];
    authorsOrder: ID[];
    authorsBotCutoff: number;
}

export type SerializedData = Uint8Array;

/*
    Names are minified to reduce the size when it's transferred from the Worker to the main thread
    It does not help with compression
*/

export interface Channel {
    // name
    n: string;
    // name searchable
    ns: string;
    msgAddr: Address;
    msgCount: number;
}

export interface Author {
    // name
    n: string;
    // name searchable
    ns: string;
    // bot
    b: boolean;
    // discriminant (#XXXX)
    d?: number;
    // Discord avatar (user_id/user_avatar)
    da?: string;
}
