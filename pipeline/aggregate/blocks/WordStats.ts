import { Index } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";

export interface WordStats {
    inputWordTest: Index;
    total: number;
    days: number[];
}

export interface WordStatsArgs {
    word: Index;
}

const fn: BlockFn<WordStats, WordStatsArgs> = (database, filters, common, args) => {
    /* This is a test block! */

    return {
        inputWordTest: args.word,
        total: 42,
        days: new Array(database.time.numDays).fill(69),
    };
};

export default {
    key: "word-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"word-stats", WordStats, WordStatsArgs>;
