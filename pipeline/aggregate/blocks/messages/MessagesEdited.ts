import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface MessagesEdited {
    count: {
        /** Number of messages edited by each author */
        authors: number[];
        /** Number of messages edited in each channel */
        channels: number[];
    };

    /** Edit time distribution in seconds */
    timeDistribution: {
        /** Number of edits in seconds since message creation, in `breaks` buckets of `(upper-lower)/breaks` */
        count: number[];
        breaks: number;
        /** Boxplot */
        metrics: {
            whiskerMin: number;
            q1: number;
            median: number;
            q3: number;
            whiskerMax: number;
            outliers: number;
        };
    };
}

const fn: BlockFn<MessagesEdited> = (database, filters) => {
    const res: MessagesEdited = {
        count: {
            authors: new Array(database.authors.length).fill(0),
            channels: new Array(database.channels.length).fill(0),
        },
        timeDistribution: {
            count: [],
            breaks: 0,
            metrics: {
                whiskerMin: 0,
                q1: 0,
                median: 0,
                q3: 0,
                whiskerMax: 0,
                outliers: 0,
            },
        },
    };

    const times = new Uint32Array(database.numMessages).fill(0xfffffff0);
    let times_count = 0;

    const processMessage = (msg: MessageView) => {
        if (msg.hasEdits) {
            res.count.authors[msg.authorIndex]++;
            res.count.channels[msg.channelIndex]++;
            times[times_count++] = msg.editedAfter!;
        }
    };

    filterMessages(processMessage, database, filters);

    if (times_count > 1) {
        // sort times ascending
        times.sort();

        // calculate boxplot
        const min = times[0];
        const max = times[times_count - 1];
        const q1_i = Math.floor(times_count * 0.25);
        const q2_i = Math.floor(times_count * 0.5);
        const q3_i = Math.floor(times_count * 0.75);
        const q1 = times[q1_i];
        const q2 = times[q2_i];
        const q3 = times[q3_i];
        const iqr = q3 - q1;
        const lower = Math.floor(Math.max(min, q1 - iqr * 1.5));
        const upper = Math.ceil(Math.min(max, q3 + iqr * 1.5));

        // calculate distribution
        const breaks = Math.min(upper - lower, 3 * 60) || 0; // up to 180 divisions, looks good for < 3 minutes (which is the most common case)
        res.timeDistribution.count = new Array(breaks).fill(0);
        res.timeDistribution.breaks = breaks;
        res.timeDistribution.metrics = {
            whiskerMin: lower,
            q1,
            median: q2,
            q3,
            whiskerMax: upper,
            outliers: 0,
        };

        for (let i = 0; i < times_count; i++) {
            const time = times[i];
            if (time >= lower && time < upper) {
                res.timeDistribution.count[Math.floor(((time - lower) / (upper - lower)) * breaks)]++;
            } else {
                res.timeDistribution.metrics.outliers++;
            }
        }
    }

    return res;
};

export default {
    key: "messages-edited",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"messages-edited", MessagesEdited>;
