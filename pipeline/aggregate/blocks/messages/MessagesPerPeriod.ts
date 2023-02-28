import { Day } from "@pipeline/Time";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { DateItem } from "@pipeline/aggregate/Common";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

/**
 * Number of messages per different time cycles.
 * It ignores the time filter completely, all cycles are included.
 */
export interface MessagesPerPeriod {
    perDay: DateItem[];
    perWeek: DateItem[];
    perMonth: DateItem[];
}

const fn: BlockFn<MessagesPerPeriod> = (database, filters, common) => {
    const res: MessagesPerPeriod = {
        perDay: [],
        perWeek: [],
        perMonth: [],
    };

    const { dateKeys, weekKeys, monthKeys, dateToWeekIndex, dateToMonthIndex } = common.timeKeys;

    // fill empty
    for (const dateKey of dateKeys) {
        res.perDay.push({
            ts: Day.fromKey(dateKey).toTimestamp(),
            v: 0,
        });
    }
    for (const weekKey of weekKeys) {
        res.perWeek.push({
            ts: Day.fromKey(weekKey).toTimestamp(),
            v: 0,
        });
    }
    for (const monthKey of monthKeys) {
        res.perMonth.push({
            ts: Day.fromKey(monthKey).toTimestamp(),
            v: 0,
        });
    }

    const processMessage = (msg: MessageView) => {
        res.perDay[msg.dayIndex].v++;
        res.perWeek[dateToWeekIndex[msg.dayIndex]].v++;
        res.perMonth[dateToMonthIndex[msg.dayIndex]].v++;
    };

    filterMessages(processMessage, database, filters, {
        authors: true,
        channels: true,
        // do not filter by time
        time: false,
    });

    return res;
};

export default {
    key: "messages/per-period",
    triggers: ["authors", "channels"],
    fn,
} as BlockDescription<"messages/per-period", MessagesPerPeriod>;
