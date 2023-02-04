import { Progress } from "@pipeline/Progress";

/**
 * Generates the ranks of the values from highest to lowest. If one value is negative, it will be represented as `-1`.
 *
 * This function aims to resemble `argsort(argsort(-x))` of NumPy and `rank(-x)-1` of R (but filtering negative values)
 */
export const rank = (values: number[] | Uint32Array): number[] => {
    const sortedIndexes = new Array(values.length)
        .fill(0)
        .map((_, idx) => [idx, values[idx]])
        .sort((a, b) => b[1] - a[1]);

    const mapping: number[] = new Array(values.length).fill(-1);

    let i = 0,
        j = 0;
    while (i < sortedIndexes.length) {
        const [idx, count] = sortedIndexes[i];

        if (count >= 0) {
            mapping[idx] = j++;
        }

        i++;
    }

    return mapping;
};

/** Maps the values from one array to another, using the given ranks and function */
export const remap = <From, To>(
    fn: (value: From, oldIndex: number) => To,
    from: From[],
    ranks: number[],
    progress?: Progress
): To[] => {
    const result: To[] = new Array(from.length).fill(undefined);

    for (let oldIndex = 0; oldIndex < from.length; oldIndex++) {
        const newIndex = ranks[oldIndex];
        if (newIndex >= 0) result[newIndex] = fn(from[oldIndex], oldIndex);
        progress?.progress("number", oldIndex, from.length);
    }

    return result.filter((v) => v !== undefined);
};
