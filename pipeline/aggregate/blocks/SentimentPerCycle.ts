import { Day } from "@pipeline/Time";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export type SentimentInDate = {
    t: number; // timestamp

    p: number; // tokens with positive sentiment
    n: number; // tokens with negative sentiment

    // raw diff, one of the following is always 0
    rawDiffP: number;
    rawDiffN: number;

    // normalized diff, one of the following is always 0
    percDiffP: number;
    percDiffN: number;
};

export interface SentimentPerCycle {
    perMonth: SentimentInDate[];
    perWeek: SentimentInDate[];
}

const fn: BlockFn<SentimentPerCycle> = (database, filters, common) => {
    const res: SentimentPerCycle = {
        perMonth: [],
        perWeek: [],
    };

    const { monthKeys, weekKeys, dateToMonthIndex, dateToWeekIndex } = common.timeKeys;

    // fill empty
    for (const monthKey of monthKeys) {
        res.perMonth.push({
            t: Day.fromKey(monthKey).toTimestamp(),
            p: 0,
            n: 0,
            rawDiffP: 0,
            rawDiffN: 0,
            percDiffP: 0,
            percDiffN: 0,
        });
    }
    for (const weekKey of weekKeys) {
        res.perWeek.push({
            t: Day.fromKey(weekKey).toTimestamp(),
            p: 0,
            n: 0,
            rawDiffP: 0,
            rawDiffN: 0,
            percDiffP: 0,
            percDiffN: 0,
        });
    }

    const processMessage = (msg: MessageView) => {
        const sentiment = msg.sentiment;
        if (sentiment !== undefined && sentiment !== 0) {
            if (sentiment > 0) {
                res.perMonth[dateToMonthIndex[msg.dayIndex]].p += 1;
                res.perWeek[dateToWeekIndex[msg.dayIndex]].p += 1;
            } else {
                res.perMonth[dateToMonthIndex[msg.dayIndex]].n -= 1;
                res.perWeek[dateToWeekIndex[msg.dayIndex]].n -= 1;
            }
        }
    };

    parseAndFilterMessages(processMessage, database, filters);

    const post = (e: SentimentInDate) => {
        const p = Math.abs(e.p);
        const n = Math.abs(e.n);
        const total = p + n;
        const diff = p - n;

        e.rawDiffP = Math.max(0, diff);
        e.rawDiffN = Math.min(0, diff);

        if (total > 0) {
            e.percDiffP = (Math.max(0, diff) / total) * 100;
            e.percDiffN = (Math.min(0, diff) / total) * 100;
        }
    };

    res.perWeek.forEach(post);
    res.perMonth.forEach(post);

    return res;
};

export default {
    key: "sentiment-per-cycle",
    triggers: ["authors", "channels"],
    fn,
} as BlockDescription<"sentiment-per-cycle", SentimentPerCycle>;
