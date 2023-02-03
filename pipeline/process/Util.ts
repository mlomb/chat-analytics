/**
 * Generates the ranks of the values from highest to lowest.
 *
 * This function aims to resemble `argsort(argsort(-x))` of NumPy and `rank(-x)-1` of R.
 */
export const rank = (values: number[] | Uint32Array): number[] => {
    const sortedIndexes = new Array(values.length)
        .fill(0)
        .map((_, idx) => [idx, values[idx]])
        .sort((a, b) => b[1] - a[1]);

    const mapping = new Array(values.length).fill(-1);

    for (let i = 0; i < sortedIndexes.length; i++) {
        mapping[sortedIndexes[i][0]] = i;
    }

    return mapping;
};

/**
 * Maps the values from one array to another, using the given ranks.
 * If the function returns `undefined`, the value will be filtered out.
 */
export const remap = <From, To>(
    fn: (value: From, oldIndex: number) => To | undefined,
    from: From[],
    ranks: number[]
): To[] => {
    console.assert(from.length === ranks.length);

    const result: (To | undefined)[] = new Array(from.length);

    for (let oldIndex = 0; oldIndex < from.length; oldIndex++) {
        result[ranks[oldIndex]] = fn(from[oldIndex], oldIndex);
    }

    return result.filter((x) => x !== undefined) as To[];
};
