import { Day } from "@pipeline/Time";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export type SentimentInDate = {
    t: number; // timestamp

    p: number; // messages with positive sentiment
    n: number; // messages with negative sentiment
    z: number; // messages with neutral sentiment

    // raw diff, one of the following is always 0
    diffP: number;
    diffN: number;

    // normalized diff, one of the following is always 0
    percP: number;
    percN: number;
};

export interface SentimentPerCycle {
    positiveMessages: number;
    negativeMessages: number;
    neutralMessages: number;

    perMonth: SentimentInDate[];
    perWeek: SentimentInDate[];
}

const fn: BlockFn<SentimentPerCycle> = (args, database, filters, common) => {
    const res: SentimentPerCycle = {
        positiveMessages: 0,
        negativeMessages: 0,
        neutralMessages: 0,
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
            z: 0,
            diffP: 0,
            diffN: 0,
            percP: 0,
            percN: 0,
        });
    }
    for (const weekKey of weekKeys) {
        res.perWeek.push({
            t: Day.fromKey(weekKey).toTimestamp(),
            p: 0,
            n: 0,
            z: 0,
            diffP: 0,
            diffN: 0,
            percP: 0,
            percN: 0,
        });
    }

    const processMessage = (msg: MessageView) => {
        const sentiment = msg.sentiment;
        if (sentiment !== undefined) {
            if (sentiment === 0) {
                res.neutralMessages++;
                res.perMonth[dateToMonthIndex[msg.dayIndex]].z += 1;
                res.perWeek[dateToWeekIndex[msg.dayIndex]].z += 1;
            } else if (sentiment > 0) {
                res.positiveMessages++;
                res.perMonth[dateToMonthIndex[msg.dayIndex]].p += 1;
                res.perWeek[dateToWeekIndex[msg.dayIndex]].p += 1;
            } else {
                res.negativeMessages++;
                res.perMonth[dateToMonthIndex[msg.dayIndex]].n -= 1;
                res.perWeek[dateToWeekIndex[msg.dayIndex]].n -= 1;
            }
        }
    };

    filterMessages(processMessage, database, filters, { channels: true, authors: true, time: false });

    const post = (e: SentimentInDate) => {
        const p = Math.abs(e.p);
        const n = Math.abs(e.n);
        const total = p + n + e.z;
        const diff = p - n;

        e.diffP = Math.max(0, diff);
        e.diffN = Math.min(0, diff);

        if (total > 0) {
            e.percP = (p / total) * 100;
            e.percN = (-n / total) * 100;
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
