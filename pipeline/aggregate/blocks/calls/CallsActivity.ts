import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { WeekdayHourEntry } from "@pipeline/aggregate/Common";

export interface CallsActivity {
    /** Each entry contains the total amount of seconds spent in calls for that hour of the week */
    weekdayHourActivity: WeekdayHourEntry[];
}

const fn: BlockFn<CallsActivity> = (database, filters, common) => {
    const weekdayHourDurations: number[] = new Array(7 * 24).fill(0);

    for (const call of database.calls) {
        // Note: time filtered below, we have to filter each hour individually
        if (!filters.hasChannel(call.channelIndex)) continue;
        if (!filters.hasAuthor(call.authorIndex)) continue;

        const startT = call.start.dayIndex * 3600 * 24 + call.start.secondOfDay;
        const endT = startT + call.duration;

        let T = startT;
        let durationSum = 0;

        while (T < endT) {
            const nextHourT = T - (T % 3600) + 3600;
            const callDurationThisHour = Math.min(nextHourT, endT) - T;

            //////////////////
            const dayIndex = Math.floor(T / (3600 * 24));
            const dayOfWeek = common.dayOfWeek[dayIndex];
            const secondOfDay = T % (3600 * 24);

            if (filters.inTime(dayIndex)) {
                weekdayHourDurations[dayOfWeek * 24 + Math.floor(secondOfDay / 3600)] += callDurationThisHour;
            }
            //////////////////

            durationSum += callDurationThisHour;
            T = nextHourT;
        }

        // Make sure we didn't miss any seconds or add any extra seconds
        console.assert(durationSum === call.duration);
    }

    const weekdayHourActivity: WeekdayHourEntry[] = weekdayHourDurations.map((count, i) => {
        const weekday = Math.floor(i / 24);
        const hour = i % 24;
        return {
            value: count,
            hour: `${hour}hs`,
            weekday: (["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const)[weekday],
        };
    });

    return {
        weekdayHourActivity,
    };
};

export default {
    key: "calls/activty",
    triggers: ["time", "authors", "channels"],
    fn,
} as BlockDescription<"calls/activty", CallsActivity>;
