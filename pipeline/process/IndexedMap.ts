type Index = number;
type Revision = number;

/**
 * This class keeps a linear array of values and a mapping between the key of the value and its index in the array.
 * It also allows to specify a `revision` for each value, so that always the most up-to-date value is kept.
 * It does not support removing values.
 */
export class IndexedMap<Key extends string | number, Value> {
    /** Mapping between keys and indexes */
    private index = new Map<Key, { revision: Revision; index: Index }>();

    /** The linear array of values */
    private array: Value[] = [];

    /**
     * Stores a value. If a value with the same key already exists, it will keep the one with highest `revision` value.
     * @returns the index of the value in the array
     */
    set(key: Key, value: Value, revision: Revision = Number.MIN_SAFE_INTEGER): Index {
        let info = this.index.get(key);

        if (info === undefined) {
            // add new value to array and index
            info = { revision: revision, index: this.array.length };
            this.index.set(key, info);
            this.array[info.index] = value;
        } else if (revision > info.revision) {
            // update revision and replace for newer value
            info.revision = revision;
            this.array[info.index] = value;
        }

        return info.index;
    }

    reindex(fn: (index: number) => number): number[] {
        return new Array(this.array.length)
            .fill(0)
            .map((_, idx) => [idx, fn(idx)])
            .sort((a, b) => b[1] - a[1])
            .map((a) => a[0]);
    }

    remap<T>(fn: (value: Value, index: number) => T, indexes: number[]): T[] {
        return indexes.map((idx) => fn(this.array[idx], idx));
    }

    /** @returns the index of the value with the given key */
    getIndex(key: Key): Index | undefined {
        return this.index.get(key)?.index;
    }

    /** @returns the value with the given key */
    getByIndex(idx: Index): Value | undefined {
        return this.array[idx];
    }

    /** @returns the array containing all values */
    get values(): Value[] {
        return this.array;
    }

    /** @returns the number of values stored */
    get size(): number {
        return this.array.length;
    }
}
