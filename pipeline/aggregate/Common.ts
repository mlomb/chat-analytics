import { Day, TimeKeysResult, genTimeKeys } from "@pipeline/Time";
import { Index } from "@pipeline/Types";
import { Database } from "@pipeline/process/Types";

/** This is data used by multiple blocks and can be computed only once */
export interface CommonBlockData {
    timeKeys: TimeKeysResult;
}

/** This is a common entry for multiple blocks. It associates an index with a value */
export interface IndexEntry {
    index: Index;
    value: number;
}

export const computeCommonBlockData = (database: Database): CommonBlockData => {
    const start = Day.fromKey(database.time.minDate);
    const end = Day.fromKey(database.time.maxDate);

    return { timeKeys: genTimeKeys(start, end) };
};
