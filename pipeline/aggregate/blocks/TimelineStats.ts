import { Day } from "@pipeline/Time";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

interface GrowthItem {
    ts: number;
    value: number;
}

export interface TimelineStats {
    growth: GrowthItem[];
}

const fn: BlockFn<TimelineStats> = (database, filters, common) => {
    const { dateKeys } = common.timeKeys;

    const firstMessageDay: number[] = new Array(database.authors.length).fill(-1);

    const processMessage = (msg: MessageView) => {
        if (firstMessageDay[msg.authorIndex] === -1 || msg.dayIndex < firstMessageDay[msg.authorIndex])
            firstMessageDay[msg.authorIndex] = msg.dayIndex;
    };

    parseAndFilterMessages(processMessage, database, filters);

    const newAuthorsInDay = Object.values(firstMessageDay)
        .filter((day) => day !== -1)
        .sort((a, b) => a - b)
        .reduce<{ [key: string]: number }>((acc: any, day: number) => {
            if (day in acc) {
                acc[day]++;
            } else {
                acc[day] = 1;
            }
            return acc;
        }, {});

    const growth: GrowthItem[] = [];
    const newAuthorsInDayKeys = Object.keys(newAuthorsInDay);
    let accum = 0;
    for (let i = 0; i < newAuthorsInDayKeys.length; i++) {
        const dayIndex = newAuthorsInDayKeys[i];
        accum += newAuthorsInDay[dayIndex];
        growth.push({
            ts: Day.fromKey(dateKeys[dayIndex as unknown as number]).toTimestamp(),
            value: accum,
        });
    }

    return { growth };
};

export default {
    key: "timeline-stats",
    triggers: ["authors", "channels"],
    fn,
} as BlockDescription<"timeline-stats", TimelineStats>;
