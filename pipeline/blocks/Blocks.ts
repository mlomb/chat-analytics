import { ID, DateStr, ProcessedData } from "@pipeline/preprocess/ProcessedData";

export interface Filters {
    channels: ID[];
    authors: ID[];
    startDate: DateStr;
    endDate: DateStr;
}

export type BlockState = "no-data" | "ready" | "stale" | "loading" | "error";

export type Trigger = "authors" | "channels" | "time";

export type BlockKey = string;

export type BlockProcessFn<T> = (source: ProcessedData, filters: Filters) => T;

export interface BlockDesc {
    triggers: Trigger[];
}

export interface BlocksDescMap {
    [key: BlockKey]: BlockDesc;
}

export const BlocksProcessFn: {
    [key: BlockKey]: BlockProcessFn<any>;
} = {};

export const BlocksDesc: BlocksDescMap = {};

//
// Register all blocks
//
import "./MessagesPerCycle";
