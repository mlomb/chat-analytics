import { ID, ProcessedData } from "@pipeline/preprocess/ProcessedData";

export interface Filters {
    channels: ID[];
    authors: ID[];
    startDate: Date;
    endDate: Date;
}

export type BlockState = "no-data" | "ready" | "stale" | "loading" | "error";

export type BlockKey = string;

export type BlockProcessFn<T> = (source: ProcessedData, filters: Filters) => T;

export const BlockProcessFns: {
    [key: BlockKey]: BlockProcessFn<any>;
} = {};

//
// Register all blocks
//
import "./MessagesPerCycle";
