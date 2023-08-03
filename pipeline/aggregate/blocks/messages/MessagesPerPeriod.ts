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

    const { keyToTimestamp } = common;
    const { dateToWeekIndex, dateToMonthIndex } = common.timeKeys;

    // fill empty
    for (const ts of keyToTimestamp.date) {
        res.perDay.push({
            ts,
            v: 0,
        });
    }
    for (const ts of keyToTimestamp.week) {
        res.perWeek.push({
            ts,
            v: 0,
        });
    }
    for (const ts of keyToTimestamp.month) {
        res.perMonth.push({
            ts,
            v: 0,
        });
    }

    const processMessage = (msg: MessageView) => {
        if (typeof msg.dayIndex !== "number" || msg.dayIndex > 850) {
            console.log("msg.dayIndex:", msg.dayIndex, "perDay.length:", res.perDay.length);
        }

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
