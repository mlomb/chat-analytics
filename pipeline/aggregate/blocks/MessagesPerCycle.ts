import { Day } from "@pipeline/Time";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

type MessagesInDate = {
    d: number; // date, as timestamp
    m: number; // messages
};

export interface MessagesPerCycle {
    perDay: MessagesInDate[];
    perMonth: MessagesInDate[];
}

const fn: BlockFn<MessagesPerCycle> = (database, filters, common) => {
    const res: MessagesPerCycle = {
        perDay: [],
        perMonth: [],
    };

    const { dateKeys, monthKeys, dateToMonthIndex } = common.timeKeys;

    // fill empty
    for (const dateKey of dateKeys) {
        res.perDay.push({
            d: Day.fromKey(dateKey).toTimestamp(),
            m: 0,
        });
    }
    for (const monthKey of monthKeys) {
        res.perMonth.push({
            d: Day.fromKey(monthKey).toTimestamp(),
            m: 0,
        });
    }

    const processMessage = (msg: MessageView) => {
        res.perDay[msg.dayIndex].m++;
        res.perMonth[dateToMonthIndex[msg.dayIndex]].m++;
    };

    parseAndFilterMessages(processMessage, database, filters, {
        authors: true,
        channels: true,
        // do not filter by time
        time: false,
    });

    return res;
};

export default {
    key: "messages-per-cycle",
    triggers: ["authors", "channels"],
    fn,
} as BlockDescription<"messages-per-cycle", MessagesPerCycle>;
