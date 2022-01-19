import { Database, Index } from "@pipeline/Types";
import { TimeKeysResult } from "@pipeline/Time";
import { Filters } from "@pipeline/aggregate/Filters";

// this is data used by multiple blocks and can be computed only once
export interface CommonBlockData {
    timeKeys: TimeKeysResult;
}

export type BlockState = "loading" | "stale" | "ready" | "error";
export type BlockTrigger = "authors" | "channels" | "time";
export type BlockFn<T> = (database: Database, filters: Filters, common: CommonBlockData) => T;
export type BlockDescription<K, T> = {
    key: K;
    triggers: BlockTrigger[];
    fn: BlockFn<T>;
};

// register blocks
import MessagesPerCycle from "@pipeline/aggregate/blocks/MessagesPerCycle";
import MessagesStats from "@pipeline/aggregate/blocks/MessagesStats";
import LanguageStats from "@pipeline/aggregate/blocks/LanguageStats";
import EmojiStats from "@pipeline/aggregate/blocks/EmojiStats";
import InteractionStats from "@pipeline/aggregate/blocks/InteractionStats";
import ExternalStats from "@pipeline/aggregate/blocks/ExternalStats";

export const Blocks = {
    [MessagesPerCycle.key]: MessagesPerCycle,
    [MessagesStats.key]: MessagesStats,
    [LanguageStats.key]: LanguageStats,
    [EmojiStats.key]: EmojiStats,
    [InteractionStats.key]: InteractionStats,
    [ExternalStats.key]: ExternalStats,
} as const;

export type BlockKey = keyof typeof Blocks;
export type BlockDataType<K extends BlockKey> = ReturnType<typeof Blocks[K]["fn"]>;
export type BlockInfo<K extends BlockKey> = {
    state: BlockState;
    data: BlockDataType<K> | null;
};
export type BlockDescriptions = {
    [K in BlockKey]: Omit<BlockDescription<K, BlockDataType<K>>, "fn">;
};

// common interfaces used by multiple blocks
export interface IndexEntry {
    index: Index;
    value: number;
}
