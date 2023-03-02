import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { DateItem } from "@pipeline/aggregate/Common";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { TimelineSeriesDefinition, generateSeries } from "@pipeline/aggregate/blocks/timeline/Series";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface GrowthTimeline {
    perSeriesPerMonth: DateItem[][];
}

const fn: BlockFn<GrowthTimeline> = (database, filters, common, args) => {
    const { keyToTimestamp } = common;
    const { dateKeys } = common.timeKeys;

    const computeForSeries = (def: TimelineSeriesDefinition) => {
        let foundAtLeastOneMessage = false;

        // the day each author posted their first message
        const firstMessageDay: number[] = new Array(database.authors.length).fill(-1);

        const processMessage = (msg: MessageView) => {
            if (msg.guildIndex === def.guildIndex || msg.channelIndex === def.channelIndex) {
                if (firstMessageDay[msg.authorIndex] === -1 || msg.dayIndex < firstMessageDay[msg.authorIndex])
                    firstMessageDay[msg.authorIndex] = msg.dayIndex;

                foundAtLeastOneMessage = true;
            }
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
                    ts: keyToTimestamp.date[i],
                    v: accum,
                });
            }

            // last data point
            growth.push({
                ts: keyToTimestamp.date[dateKeys.length - 1],
                v: accum,
            });
        }

        return growth;
    };

    const res: GrowthTimeline = {
        perSeriesPerMonth: generateSeries(database).map(computeForSeries),
    };

    return res;
};

export default {
    key: "timeline/growth",
    triggers: ["authors", "channels"],
    fn,
} as BlockDescription<"timeline/growth", GrowthTimeline>;
