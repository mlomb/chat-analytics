import { Day } from "@pipeline/Time";
import { Index } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

interface Item {
    ts: number;
    value: number;
}

export interface ActiveAuthors {
    perMonth: Item[];
}

const fn: BlockFn<ActiveAuthors> = (database, filters, common, args) => {
    const { monthKeys, dateToMonthIndex } = common.timeKeys;

    // TODO: optimize this with a bitset or something, using a Set may use too much memory if there are many authors
    const authorsPresentInMonth: Set<Index>[] = [];
    for (const _ of monthKeys) authorsPresentInMonth.push(new Set());

    const processMessage = (msg: MessageView) =>
        authorsPresentInMonth[dateToMonthIndex[msg.dayIndex]].add(msg.authorIndex);

    filterMessages(processMessage, database, filters, { channels: true, authors: true, time: false });

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
    key: "active-authors",
    triggers: ["authors", "channels"],
    fn,
} as BlockDescription<"active-authors", ActiveAuthors>;
