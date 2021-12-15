/*
This is the interface generated after preprocessing

It needs to be trivally serializable because it will be stored in the report file
*/

import { Platform } from "@pipeline/Types";

type ID = string;
type DateStr = string; // YYYY-MM-DD

export interface ProcessedData {
    platform: Platform;
    title: string;
    minDate: DateStr;
    maxDate: DateStr;

    channels: Channel[];
    authors: Author[];
}

export interface Channel {
    id: ID;
    name: string;
    name_searchable: string;
    messages: Message[];
}

export interface Author {
    id: ID;
    name: string;
    name_searchable: string;
    bot: boolean;
}

export interface Message {
    date: [number, number, number];
    authorId: ID;
    channelId: ID;
}
