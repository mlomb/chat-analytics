import { Message } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { genTimeKeys } from "@pipeline/Util";

type MessagesInDate = {
    d: number; // date, as timestamp
    m: number; // messages
};

export interface MessagesPerCycle {
    perDay: MessagesInDate[];
    perMonth: MessagesInDate[];
}

const fn: BlockFn<MessagesPerCycle> = (database, filters) => {
    const res: MessagesPerCycle = {
        perDay: [],
        perMonth: [],
    };

    const { dayKeys, monthKeys, dayToMonthIndex } = genTimeKeys(database.time.minDate, database.time.maxDate);

    // fill empty
    for (const dayKey of dayKeys) {
        res.perDay.push({
            d: new Date(dayKey).getTime(),
            m: 0,
        });
    }
    for (const monthKey of monthKeys) {
        res.perMonth.push({
            d: new Date(monthKey).getTime(),
            m: 0,
        });
    }

    const processMessage = (msg: Message) => {
        res.perDay[msg.dayIndex].m++;
        res.perMonth[dayToMonthIndex[msg.dayIndex]].m++;
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
