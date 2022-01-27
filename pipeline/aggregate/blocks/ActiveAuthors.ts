import { Index } from "@pipeline/Types";
import { Day } from "@pipeline/Time";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

interface Item {
    ts: number;
    value: number;
}

export interface ActiveAuthors {
    perMonth: Item[];
}

const fn: BlockFn<ActiveAuthors> = (database, filters, common) => {
    const { monthKeys, dateToMonthIndex } = common.timeKeys;

    // TODO: optimize this with a bitset or something, using a Set may use too much memory if there are many authors
    const authorsPresentInMonth: Set<Index>[] = [];
    for (const _ of monthKeys) authorsPresentInMonth.push(new Set());

    const processMessage = (msg: MessageView) => {
        authorsPresentInMonth[dateToMonthIndex[msg.dayIndex]].add(msg.authorIndex);
    };

    parseAndFilterMessages(processMessage, database, filters, { channels: true, authors: true, time: false });

    const res: ActiveAuthors = {
        perMonth: [],
    };

    for (let i = 0; i < monthKeys.length; i++) {
        res.perMonth.push({
            ts: Day.fromKey(monthKeys[i]).toTimestamp(),
            value: authorsPresentInMonth[i].size,
        });
    }

    return res;
};

export default {
    key: "acitve-authors",
    triggers: ["authors", "channels"],
    fn,
} as BlockDescription<"acitve-authors", ActiveAuthors>;
