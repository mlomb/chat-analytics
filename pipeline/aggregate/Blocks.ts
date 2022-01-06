import { Database } from "@pipeline/Types";
import { Filters } from "@pipeline/aggregate/Filters";

export type BlockState = "loading" | "stale" | "ready" | "error";
export type BlockTrigger = "authors" | "channels" | "time";
export type BlockFn<T> = (database: Database, filters: Filters) => T;
export type BlockDescription<K, T> = {
    key: K;
    triggers: BlockTrigger[];
    fn: BlockFn<T>;
};

// register blocks
import MessagesPerCycle from "@pipeline/aggregate/blocks/MessagesPerCycle";
import MessagesStats from "@pipeline/aggregate/blocks/MessagesStats";

export const Blocks = {
    [MessagesPerCycle.key]: MessagesPerCycle,
    [MessagesStats.key]: MessagesStats,
};

export type BlockKey = keyof typeof Blocks;
export type BlockDataType<K extends BlockKey> = ReturnType<typeof Blocks[K]["fn"]>;
export type BlockInfo<K extends BlockKey> = {
    state: BlockState;
    data: BlockDataType<K> | null;
};
export type BlockDescriptions = {
    [K in BlockKey]: Omit<BlockDescription<K, BlockDataType<K>>, "fn">;
};
