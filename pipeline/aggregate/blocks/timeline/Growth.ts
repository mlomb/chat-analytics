import { Day } from "@pipeline/Time";
import { Index } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { DateItem } from "@pipeline/aggregate/Common";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface GrowthTimeline {
    perGuildPerDay: DateItem[][];
}

const fn: BlockFn<GrowthTimeline> = (database, filters, common, args) => {
    const { dateKeys } = common.timeKeys;

    const computeForGuild = (guildIndex: Index) => {
        let foundAtLeastOneMessage = false;

        // the day each author posted their first message
        const firstMessageDay: number[] = new Array(database.authors.length).fill(-1);

        const processMessage = (msg: MessageView) => {
            if (msg.guildIndex !== guildIndex) return;

            if (firstMessageDay[msg.authorIndex] === -1 || msg.dayIndex < firstMessageDay[msg.authorIndex])
                firstMessageDay[msg.authorIndex] = msg.dayIndex;

            foundAtLeastOneMessage = true;
        };

        filterMessages(processMessage, database, filters, { channels: true, authors: true, time: false });

        // count the number of authors who posted their first message on each day
        const newAuthorsInDay = new Array(database.time.numDays).fill(0);
        for (const dayIndex of firstMessageDay) {
            if (dayIndex !== -1) newAuthorsInDay[dayIndex]++;
        }

        const growth: DateItem[] = [];

        if (foundAtLeastOneMessage) {
            // compute the growth
            let accum = 0;
            for (let i = 0; i < database.time.numDays; i++) {
                accum += newAuthorsInDay[i];
                growth.push({
                    ts: Day.fromKey(dateKeys[i]).toTimestamp(),
                    value: accum,
                });
            }

            // last data point
            growth.push({
                ts: Day.fromKey(dateKeys[dateKeys.length - 1]).toTimestamp(),
                value: accum,
            });
        }

        return growth;
    };

    const res: GrowthTimeline = {
        perGuildPerDay: database.guilds.map((_, guildIndex) => computeForGuild(guildIndex)),
    };

    return res;
};

export default {
    key: "timeline/growth",
    triggers: ["authors", "channels"],
    fn,
} as BlockDescription<"timeline/growth", GrowthTimeline>;
