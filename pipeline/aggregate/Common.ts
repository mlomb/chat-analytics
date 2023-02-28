import { Day, TimeKeysResult, genTimeKeys } from "@pipeline/Time";
import { Index } from "@pipeline/Types";
import { Database } from "@pipeline/process/Types";

/** This is data used by multiple blocks and can be computed only once */
export interface CommonBlockData {
    timeKeys: TimeKeysResult;
}

export const computeCommonBlockData = (database: Database): CommonBlockData => {
    const start = Day.fromKey(database.time.minDate);
    const end = Day.fromKey(database.time.maxDate);

    return { timeKeys: genTimeKeys(start, end) };
};

export interface VariableDistribution {
    total: number;
    /** Aggregation in `count.length` buckets of `(whiskerMax-whiskerMin)/count.length` */
    count: number[];
    /** Boxplot */
    boxplot: {
        min: number;
        whiskerMin: number;
        q1: number;
        median: number;
        q3: number;
        whiskerMax: number;
        max: number;
        outliers: number;
    };
}

export const computeVariableDistribution = (values: Uint32Array, count: number): VariableDistribution => {
    const res: VariableDistribution = {
        total: count,
        count: [],
        boxplot: {
            min: 0,
            whiskerMin: 0,
            q1: 0,
            median: 0,
            q3: 0,
            whiskerMax: 0,
            max: 0,
            outliers: 0,
        },
    };

    // not enough data
    if (count <= 1) return res;

    // sort times ascending
    // IMPORTANT: it assumes that all values AFTER `count` are bigger than all values BEFORE.
    //            Preferably, initialize the values with a big value like 0xfffffff0
    values.sort();

    // calculate boxplot
    const min = values[0];
    const max = values[count - 1];
    const q1_i = Math.floor(count * 0.25);
    const q2_i = Math.floor(count * 0.5);
    const q3_i = Math.floor(count * 0.75);
    const q1 = values[q1_i];
    const q2 = values[q2_i];
    const q3 = values[q3_i];
    const iqr = q3 - q1;
    const lower = Math.floor(Math.max(min, q1 - iqr * 1.5));
    const upper = Math.ceil(Math.min(max, q3 + iqr * 1.5));

    // calculate distribution
    const buckets = Math.min(upper - lower, 3 * 60) || 0; // up to 180 divisions
    res.count = new Array(buckets).fill(0);
    res.boxplot = {
        min,
        whiskerMin: lower,
        q1,
        median: q2,
        q3,
        whiskerMax: upper,
        max,
        outliers: 0,
    };

    for (let i = 0; i < count; i++) {
        const time = values[i];
        if (time >= lower && time < upper) {
            res.count[Math.floor(((time - lower) / (upper - lower)) * buckets)]++;
        } else {
            res.boxplot.outliers++;
        }
    }

    return res;
};

/** This is a common entry for multiple blocks. It associates an index with a value */
export interface IndexEntry {
    index: Index;
    value: number;
}

/** Entry for date based graph */
export interface DateItem {
    ts: number;
    value: number;
}
