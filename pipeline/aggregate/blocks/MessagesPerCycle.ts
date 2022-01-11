import { Message } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { Day, genTimeKeys } from "@pipeline/Time";

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

    const { dateKeys, monthKeys, dateToMonthIndex } = genTimeKeys(
        Day.fromKey(database.time.minDate),
        Day.fromKey(database.time.maxDate)
    );

    // fill empty
    for (const dateKey of dateKeys) {
        res.perDay.push({
            d: new Date(dateKey).getTime(),
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
