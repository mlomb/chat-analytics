import { Report } from "@pipeline/Analyzer";
import { BlockData, BlockProcessFn } from "./Blocks";

export type asd = {
    date: number; // timestamp
    messages: number;
};

export interface MessagesPerCycleBlock extends BlockData {
    perDay: asd[];
    perMonth: asd[];
}

export const process: BlockProcessFn<MessagesPerCycleBlock> = (source) => {
    return {
        perDay: [],
        perMonth: [],
    };
};
