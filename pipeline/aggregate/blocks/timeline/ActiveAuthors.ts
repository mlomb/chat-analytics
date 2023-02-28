import { Day } from "@pipeline/Time";
import { Index } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { DateItem } from "@pipeline/aggregate/Common";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface ActiveAuthorsTimeline {
    perGuildPerMonth: DateItem[][];
}

const fn: BlockFn<ActiveAuthorsTimeline> = (database, filters, common, args) => {
    const { monthKeys, dateToMonthIndex } = common.timeKeys;

    const computeForGuild = (guildIndex: Index) => {
        let foundAtLeastOneMessage = false;

        // TODO: optimize this with a bitset or something, using a Set may use too much memory if there are many authors
        const authorsPresentInMonth: Set<Index>[] = [];
        for (const _ of monthKeys) authorsPresentInMonth.push(new Set());

        const processMessage = (msg: MessageView) => {
            if (msg.guildIndex === guildIndex) {
                authorsPresentInMonth[dateToMonthIndex[msg.dayIndex]].add(msg.authorIndex);
                foundAtLeastOneMessage = true;
            }
        };

        filterMessages(processMessage, database, filters, { channels: true, authors: true, time: false });

        const items: DateItem[] = [];

        if (foundAtLeastOneMessage) {
            for (let i = 0; i < monthKeys.length; i++) {
                items.push({
                    ts: Day.fromKey(monthKeys[i]).toTimestamp(),
                    value: authorsPresentInMonth[i].size,
                });
            }
        }

        return items;
    };

    const res: ActiveAuthorsTimeline = {
        perGuildPerMonth: database.guilds.map((_, guildIndex) => computeForGuild(guildIndex)),
    };

    return res;
};

export default {
    key: "timeline/active-authors",
    triggers: ["authors", "channels"],
    fn,
} as BlockDescription<"timeline/active-authors", ActiveAuthorsTimeline>;
