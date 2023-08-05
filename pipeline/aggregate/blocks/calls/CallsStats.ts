import { Datetime, diffDatetime } from "@pipeline/Time";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

interface CallDuration {
    duration: number;
    start: Datetime;
}

export interface CallsStats {
    /** Total number of calls */
    total: number;
    /** Total number of seconds spent in calls */
    secondsInCall: number;
    medianDuration: number;
    averageDuration: number;

    longestCall?: CallDuration;
}

const fn: BlockFn<CallsStats> = (database, filters, common, args) => {
    const { dateKeys } = common.timeKeys;

    let total = 0;
    let secondsInCall = 0;
    let longestCall: CallDuration | undefined = undefined;
    let lastCall: Datetime | undefined = undefined;

    const durations: number[] = [];
    const timesBetween: number[] = [];

    for (const call of database.calls) {
        if (!filters.inTime(call.start.dayIndex)) continue;
        if (!filters.hasChannel(call.channelIndex)) continue;
        if (!filters.hasAuthor(call.authorIndex)) continue;

        const startDatetime = {
            key: dateKeys[call.start.dayIndex],
            secondOfDay: call.start.secondOfDay,
        };
        const endDatetime = {
            key: dateKeys[call.end.dayIndex],
            secondOfDay: call.end.secondOfDay,
        };

        total++;
        secondsInCall += call.duration;

        if (longestCall === undefined || call.duration > longestCall.duration) {
            longestCall = {
                duration: call.duration,
                start: startDatetime,
            };
        }

        durations.push(call.duration);

        if (lastCall !== undefined) {
            // compute time difference between calls
            const diff = diffDatetime(lastCall, startDatetime);
            if (diff < 0) throw new Error("Time difference between calls is negative, diff=" + diff);
            timesBetween.push(diff);
        }
        lastCall = endDatetime;
    }

    durations.sort((a, b) => b - a);
    const medianIndex = Math.floor(durations.length / 2);
    const medianDuration = durations[medianIndex];

    console.log(timesBetween);

    return {
        total,
        secondsInCall,
        medianDuration,
        averageDuration: secondsInCall / total,
        longestCall,
        // timesBetween
    };
};

export default {
    key: "calls/stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"calls/stats", CallsStats>;
