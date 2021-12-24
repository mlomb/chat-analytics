import { ReportData } from "@pipeline/process/ReportData";
import { DataDeserializer } from "@pipeline/shared/SerializedData";
import { Filters } from "@pipeline/blocks/Filters";

export type BlockState = "no-data" | "ready" | "stale" | "loading" | "error";

export type Trigger = "authors" | "channels" | "time";

export type BlockKey = string;

export type BlockProcessFn<T> = (source: ReportData, deserializer: DataDeserializer, filters: Filters) => T;

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
import "./MessagesStats";
