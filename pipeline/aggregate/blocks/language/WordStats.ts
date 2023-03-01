import { Day } from "@pipeline/Time";
import { Index } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { DateItem } from "@pipeline/aggregate/Common";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface WordStats {
    perMonth: DateItem[];

    counts: {
        authors: number[];
        channels: number[];
    };
}

export interface WordStatsArgs {
    wordIndex: Index;
}

const fn: BlockFn<WordStats, WordStatsArgs> = (database, filters, common, args) => {
    const res: WordStats = {
        perMonth: [],

        counts: {
            authors: new Array(database.authors.length).fill(0),
            channels: new Array(database.channels.length).fill(0),
        },
    };

    const { keyToTimestamp } = common;
    const { dateToMonthIndex } = common.timeKeys;

    // fill empty
    for (const ts of keyToTimestamp.month) {
        res.perMonth.push({
            ts,
            v: 0,
        });
    }

    const processMessage = (msg: MessageView) => {
        if (!msg.hasWords) return;

        const wordInMsg = msg.words?.find(([widx, _]) => widx === args.wordIndex);

        if (wordInMsg !== undefined) {
            const count = wordInMsg[1];

            res.perMonth[dateToMonthIndex[msg.dayIndex]].v += count;
            res.counts.authors[msg.authorIndex] += count;
            res.counts.channels[msg.channelIndex] += count;
        }
    };

    filterMessages(processMessage, database, filters, {
        authors: true,
        channels: true,
        time: true,
    });

    return res;
};

export default {
    key: "language/word-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"language/word-stats", WordStats, WordStatsArgs>;
