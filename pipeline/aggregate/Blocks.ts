import { CommonBlockData } from "@pipeline/aggregate/Common";
import { Filters } from "@pipeline/aggregate/Filters";
import EmojiStats from "@pipeline/aggregate/blocks/emojis/EmojiStats";
import ConversationStats from "@pipeline/aggregate/blocks/interaction/ConversationStats";
import InteractionStats from "@pipeline/aggregate/blocks/interaction/InteractionStats";
import LanguageStats from "@pipeline/aggregate/blocks/language/LanguageStats";
import WordStats from "@pipeline/aggregate/blocks/language/WordStats";
import ExternalStats from "@pipeline/aggregate/blocks/links/ExternalStats";
import MessagesEdited from "@pipeline/aggregate/blocks/messages/MessagesEdited";
import MessagesPerCycle from "@pipeline/aggregate/blocks/messages/MessagesPerCycle";
import MessagesStats from "@pipeline/aggregate/blocks/messages/MessagesStats";
import SentimentPerCycle from "@pipeline/aggregate/blocks/sentiment/SentimentPerCycle";
import SentimentStats from "@pipeline/aggregate/blocks/sentiment/SentimentStats";
import ActiveAuthors from "@pipeline/aggregate/blocks/timeline/ActiveAuthors";
import Growth from "@pipeline/aggregate/blocks/timeline/Growth";
import { Database } from "@pipeline/process/Types";

/* Function that computes a block */
export type BlockFn<Data, Args = undefined> = (
    database: Database,
    filters: Filters,
    common: CommonBlockData,
    args: Args
) => Data;

/** Triggers that should make a block data stale (e.g. changes to this filters in the UI) */
export type Filter = "authors" | "channels" | "time";

/** A description of a block */
export type BlockDescription<K, Data, Args = undefined> = {
    key: K;
    triggers: Filter[];
    fn: BlockFn<Data, Args>;
};

/** All existing blocks must be defined here, so the UI can dynamically load them */
export const Blocks = {
    [MessagesPerCycle.key]: MessagesPerCycle,
    [MessagesEdited.key]: MessagesEdited,
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
    [WordStats.key]: WordStats,
} as const;

/** Block identifier */
export type BlockKey = keyof typeof Blocks;

/** The input arguments required for a block */
export type BlockArgs<K extends BlockKey> = Parameters<(typeof Blocks)[K]["fn"]>[3];

/** The result of a block */
export type BlockData<K extends BlockKey> = ReturnType<(typeof Blocks)[K]["fn"]>;

console.warn(
    "This message is here to prevent the inclusion of all blocks in the report UI. " +
        "You should only see this message in the console once. If you see it twice, " +
        "the report UI includes all blocks, which is not what we want."
);
