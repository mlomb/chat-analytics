import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";

export type CallsInDate = {
    ts: number; // timestamp

    n: number; // number of calls
    t: number; // total time in calls (seconds)
};

/**
 * Number of calls per different time cycles.
 * It ignores the time filter completely, all cycles are included.
 */
export interface CallsPerPeriod {
    perDay: CallsInDate[];
    perWeek: CallsInDate[];
    perMonth: CallsInDate[];
}

const fn: BlockFn<CallsPerPeriod> = (database, filters, common) => {
    const res: CallsPerPeriod = {
        perDay: [],
        perWeek: [],
        perMonth: [],
    };

    const { keyToTimestamp } = common;
    const { dateToWeekIndex, dateToMonthIndex } = common.timeKeys;

    // fill empty
    for (const ts of keyToTimestamp.date) {
        res.perDay.push({
            ts,
            n: 0,
            t: 0,
        });
    }
    for (const ts of keyToTimestamp.week) {
        res.perWeek.push({
            ts,
            n: 0,
            t: 0,
        });
    }
    for (const ts of keyToTimestamp.month) {
        res.perMonth.push({
            ts,
            n: 0,
            t: 0,
        });
    }

    for (const call of database.calls) {
        // check filters
        // if (!filters.inTime(call.start.dayIndex)) continue; // don't filter by time, UI scrolls the time natively
        if (!filters.hasChannel(call.channelIndex)) continue;
        if (!filters.hasAuthor(call.authorIndex)) continue;

        res.perDay[call.start.dayIndex].n += 1;
        res.perDay[call.start.dayIndex].t += call.duration;
        res.perWeek[dateToWeekIndex[call.start.dayIndex]].n += 1;
        res.perWeek[dateToWeekIndex[call.start.dayIndex]].t += call.duration;
        res.perMonth[dateToMonthIndex[call.start.dayIndex]].n += 1;
        res.perMonth[dateToMonthIndex[call.start.dayIndex]].t += call.duration;
    }

    return res;
};

export default {
    key: "calls/per-period",
    triggers: ["authors", "channels"],
    fn,
} as BlockDescription<"calls/per-period", CallsPerPeriod>;
