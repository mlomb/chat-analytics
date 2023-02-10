import { CommonBlockData } from "@pipeline/aggregate/Common";
import { Filters } from "@pipeline/aggregate/Filters";
import ActiveAuthors from "@pipeline/aggregate/blocks/ActiveAuthors";
import ConversationStats from "@pipeline/aggregate/blocks/ConversationStats";
import EmojiStats from "@pipeline/aggregate/blocks/EmojiStats";
import ExternalStats from "@pipeline/aggregate/blocks/ExternalStats";
import Growth from "@pipeline/aggregate/blocks/Growth";
import InteractionStats from "@pipeline/aggregate/blocks/InteractionStats";
import LanguageStats from "@pipeline/aggregate/blocks/LanguageStats";
// register blocks
import MessagesPerCycle from "@pipeline/aggregate/blocks/MessagesPerCycle";
import MessagesStats from "@pipeline/aggregate/blocks/MessagesStats";
import SentimentPerCycle from "@pipeline/aggregate/blocks/SentimentPerCycle";
import SentimentStats from "@pipeline/aggregate/blocks/SentimentStats";
import { Database } from "@pipeline/process/Types";

/** Triggers that make a block data stale (e.g. changes to this filters in the UI) */
export type BlockTrigger = "authors" | "channels" | "time";

/* Function that computes a block */
export type BlockFn<Data, Args = undefined> = (
    args: Args,
    database: Database,
    filters: Filters,
    common: CommonBlockData
) => Data;

/** A description of a block */
export type BlockDescription<K, Data, Args = undefined> = {
    key: K;
    triggers: BlockTrigger[];
    fn: BlockFn<Data, Args>;
};

export const Blocks = {
    [MessagesPerCycle.key]: MessagesPerCycle,
    [MessagesStats.key]: MessagesStats,
    [LanguageStats.key]: LanguageStats,
    [EmojiStats.key]: EmojiStats,
    [InteractionStats.key]: InteractionStats,
    [ExternalStats.key]: ExternalStats,
    [SentimentPerCycle.key]: SentimentPerCycle,
    [ConversationStats.key]: ConversationStats,
    [SentimentStats.key]: SentimentStats,
    [Growth.key]: Growth,
    [ActiveAuthors.key]: ActiveAuthors,
} as const;

/** Block identifier */
export type BlockKey = keyof typeof Blocks;

/** The input arguments required for a block */
export type BlockArgs<K extends BlockKey> = Parameters<(typeof Blocks)[K]["fn"]>[0];

/** The result of a block */
export type BlockData<K extends BlockKey> = ReturnType<(typeof Blocks)[K]["fn"]>;
