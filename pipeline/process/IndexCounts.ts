/**
 * A list of [index, count] pairs, sorted by count in descending order.
 *
 * Throughout the pipeline we store linear arrays of objects (authors, words, emojis) to index them.
 * We use this format to point which and how many of each object are used in a given context (e.g. emojis in a message)
 */
export type IndexCounts<Index extends number = number> = [Index, number][];

/** Simplifies the creation of IndexCounts */
export class IndexCountsBuilder {
    private data: Record<number, number> = {};

    /** Increment count for index */
    incr(index: number, amount: number = 1) {
        this.data[index] = (this.data[index] || 0) + amount;
    }

    /**
     * Converts to an array of [index, count] pairs.
     *
     * For example, if `data` is:
     * ```
     * {
     *  1: 2,
     *  3: 4,
     *  5: 6
     * }
     * ```
     * then the result will be
     * ```
     * [
     *  [1, 2],
     *  [3, 4],
     *  [5, 6]
     * ]
     * ```
     *
     */
    toArray<T extends number = number>(): IndexCounts<T> {
        return Object.entries(this.data)
            .sort(([_1, a], [_2, b]) => b - a) // sort by count
            .map(([index, count]) => [parseInt(index) as T, count]);
    }

    /**
     * Builds an IndexCountsBuilder from a list of indices.
     *
     * For example, if `list` is `[1, 4, 4, 1, 2, 4]`, then it will set the counts to be:
     * ```
     * {
     *  1: 2,
     *  2: 1,
     *  4: 3
     * }
     * ```
     */
    static fromList(list: number[]): IndexCountsBuilder {
        const counts = new IndexCountsBuilder();
        for (const index of list) counts.incr(index);
        return counts;
    }
}
