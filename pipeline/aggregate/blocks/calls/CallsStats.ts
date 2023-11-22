import { Datetime, diffDatetime } from "@pipeline/Time";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { VariableDistribution, computeVariableDistribution } from "@pipeline/aggregate/Common";

interface CallDuration {
    duration: number;
    start: Datetime;
}

export interface CallsStats {
    /** Total number of calls */
    total: number;
    /** Total number of seconds spent in calls */
    secondsInCall: number;

    longestCall?: CallDuration;

    /** Call duration distribution in seconds */
    durationDistribution: VariableDistribution;
    /** Time between calls distribution in seconds */
    timesBetweenDistribution: VariableDistribution;

    /** Number of calls made by each author */
    authorsCount: number[];
}

const fn: BlockFn<CallsStats> = (database, filters, common, args) => {
    const { dateKeys } = common.timeKeys;

    let total = 0;
    let secondsInCall = 0;
    let longestCall: CallDuration | undefined = undefined;
    let lastCall: Datetime | undefined = undefined;

    const authorsCount = new Array(database.authors.length).fill(0);

    const durations = new Uint32Array(database.calls.length).fill(0xfffffff0);
    const timesBetween = new Uint32Array(database.calls.length).fill(0xfffffff0);

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

        durations[total] = call.duration;
        authorsCount[call.authorIndex]++;

        if (longestCall === undefined || call.duration > longestCall.duration) {
            longestCall = {
                duration: call.duration,
                start: startDatetime,
            };
        }

        if (lastCall !== undefined) {
            // compute time difference between calls
            let diff = diffDatetime(lastCall, startDatetime);
            if (diff < 0) {
                secondsInCall += diff; // remove overlap
                diff = 0;
            }
            timesBetween[total - 1] = diff;
        }
        lastCall = endDatetime;

        secondsInCall += call.duration;
        total++;
    }

    return {
        total,
        secondsInCall,
        averageDuration: secondsInCall / total,
        longestCall,

        durationDistribution: computeVariableDistribution(durations, total),
        timesBetweenDistribution: computeVariableDistribution(timesBetween, total - 1),

        authorsCount,
    };
};

export default {
    key: "calls/stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"calls/stats", CallsStats>;
