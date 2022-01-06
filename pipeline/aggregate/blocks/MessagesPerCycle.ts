import { Message } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";

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

    // fill empty
    const dayToMonth: MessagesInDate[] = [];
    for (let i = 0; i < database.time.numDays; i++) {
        const d = new Date(database.time.minDate);
        d.setDate(d.getDate() + i);

        res.perDay.push({
            d: d.getTime(),
            m: 0,
        });

        let monthObj: MessagesInDate = {
            d: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
            m: 0,
        };
        if (res.perMonth.length === 0 || res.perMonth[res.perMonth.length - 1].d !== monthObj.d) {
            // push new month
            res.perMonth.push(monthObj);
        } else {
            // reference to the last month object
            monthObj = res.perMonth[res.perMonth.length - 1];
        }

        dayToMonth.push(monthObj);
    }

    const processMessage = (msg: Message) => {
        res.perDay[msg.dayIndex].m++;
        dayToMonth[msg.dayIndex].m++;
    };

    parseAndFilterMessages(processMessage, database, filters);

    return res;
};

export default {
    key: "messages-per-cycle",
    triggers: ["authors", "channels"],
    fn,
} as BlockDescription<"messages-per-cycle", MessagesPerCycle>;
