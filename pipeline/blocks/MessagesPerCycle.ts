import { BlockProcessFn, BlockProcessFns } from "./Blocks";

type MessagesPerCycle = {
    date: number; // timestamp
    messages: number;
};

export interface MessagesPerCycleBlock {
    perDay: MessagesPerCycle[];
    perMonth: MessagesPerCycle[];
}

export const process: BlockProcessFn<MessagesPerCycleBlock> = (source) => {
    return {
        perDay: [
            {
                date: new Date(2019, 0, 1).getTime(),
                messages: Math.random() * 100,
            },
            {
                date: new Date(2019, 0, 2).getTime(),
                messages: Math.random() * 100,
            },
            {
                date: new Date(2019, 0, 3).getTime(),
                messages: Math.random() * 100,
            },
        ],
        perMonth: [],
    };
};

BlockProcessFns["MessagesPerCycle"] = process;
