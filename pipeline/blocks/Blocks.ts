import { ProcessedData } from "@pipeline/preprocess/ProcessedData";

export type BlockState = "no-data" | "ready" | "stale" | "loading" | "error";

export type BlockKey = string;

export type BlockProcessFn<T> = (source: ProcessedData) => T;

export const BlockProcessFns: {
    [key: BlockKey]: BlockProcessFn<any>;
} = {};

//
// Register all blocks
//
import "./MessagesPerCycle";
