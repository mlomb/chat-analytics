import { BlockProcessFn, BlocksDesc, BlocksProcessFn } from "@pipeline/blocks/Blocks";

export interface MessagesStatsBlock {
    total: number;
}

export const process: BlockProcessFn<MessagesStatsBlock> = (source, filters) => {
    const res: MessagesStatsBlock = {
        total: Math.floor(Math.random() * 100),
    };

    return res;
};

BlocksProcessFn["MessagesStats"] = process;
BlocksDesc["MessagesStats"] = {
    triggers: ["authors", "channels", "time"],
};
