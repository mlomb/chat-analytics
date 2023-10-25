import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { WeekdayHourEntry } from "@pipeline/aggregate/Common";

import { iterateHoursInCall } from "./CallsUtils";

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

        iterateHoursInCall(call, (dayIndex, hourInDay, secondsInCall) => {
            if (filters.inTime(dayIndex)) {
                weekdayHourDurations[common.dayOfWeek[dayIndex] * 24 + hourInDay] += secondsInCall;
            }
        });
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
    key: "calls/activity",
    triggers: ["time", "authors", "channels"],
    fn,
} as BlockDescription<"calls/activity", CallsActivity>;
