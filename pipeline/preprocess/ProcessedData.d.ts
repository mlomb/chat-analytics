/*
This is the interface generated after preprocessing

It needs to be trivally serializable because it will be stored in the report file
*/

import { Platform } from "@pipeline/Types";

type ID = string;

export interface ProcessedData {
    platform: Platform;
    title: string;

    channels: Channel[];
    authors: Author[];
}

export interface Channel {
    id: ID;
    name: string;
    name_searchable: string;
}

export interface Author {
    id: ID;
    name: string;
    name_searchable: string;
    bot: boolean;
}
