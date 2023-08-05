import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface CallsStats {
    /** Total number of calls */
    total: number;
    /** Total number of seconds spent in calls */
    secondsInCall: number;
}

const fn: BlockFn<CallsStats> = (database, filters, common, args) => {
    const stats: CallsStats = {
        total: 0,
        secondsInCall: 0,
    };

    for (const call of database.calls) {
        if (!filters.inTime(call.start.dayIndex)) continue;
        if (!filters.hasChannel(call.channelIndex)) continue;
        if (!filters.hasAuthor(call.authorIndex)) continue;

        stats.total++;
        stats.secondsInCall += call.duration;
    }

    return stats;
};

export default {
    key: "calls/stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"calls/stats", CallsStats>;
