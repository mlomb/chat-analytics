import { Day } from "@pipeline/Time";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

interface Item {
    ts: number;
    value: number;
}

export interface TimelineStats {
    growth: Item[];
}

const fn: BlockFn<TimelineStats> = (args, database, filters, common) => {
    const { dateKeys } = common.timeKeys;

    const firstMessageDay: number[] = new Array(database.authors.length).fill(-1);

    const processMessage = (msg: MessageView) => {
        if (firstMessageDay[msg.authorIndex] === -1 || msg.dayIndex < firstMessageDay[msg.authorIndex])
            firstMessageDay[msg.authorIndex] = msg.dayIndex;
    };

    filterMessages(processMessage, database, filters, { channels: true, authors: true, time: false });

    const newAuthorsInDay = Object.values(firstMessageDay)
        .filter((day) => day !== -1)
        .sort((a, b) => a - b)
        .reduce<{ [key: string]: number }>((acc: any, day: number) => {
            if (day in acc) acc[day]++;
            else acc[day] = 1;
            return acc;
        }, {});

    const growth: Item[] = [];
    const newAuthorsInDayKeys = Object.keys(newAuthorsInDay);
    let accum = 0;
    for (const dayIndex of newAuthorsInDayKeys) {
        accum += newAuthorsInDay[dayIndex];
        growth.push({
            ts: Day.fromKey(dateKeys[dayIndex as unknown as number]).toTimestamp(),
            value: accum,
        });
    }

    // last data point
    growth.push({
        ts: Day.fromKey(dateKeys[dateKeys.length - 1]).toTimestamp(),
        value: accum,
    });

    return { growth };
};

export default {
    key: "growth",
    triggers: ["authors", "channels"],
    fn,
} as BlockDescription<"growth", TimelineStats>;
