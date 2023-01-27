import { Index, RawID, Timestamp } from "@pipeline/Types";

/**
 * This class is responsible to keep the most up-to-date information about a given entry.
 */
export class IndexedData<Key extends string | number, Value> {
    private index = new Map<Key, Index>();
    private array: Value[] = [];

    /** Stores an entry. If an entry with the same ID already exists, it will keep the one with highest `at` value */
    store(key: Key, value: Value, at?: Timestamp): Index {
        // TODO: use at...

        let idx = this.index.get(key);
        if (idx === undefined) {
            idx = this.array.length;
            this.index.set(key, idx);
        }
        this.array[idx] = value;

        return idx;
    }

    getIndex(key: Key): Index | undefined {
        return this.index.get(key);
    }

    getByIndex(idx: Index): Value | undefined {
        return this.array[idx];
    }

    get data(): Value[] {
        return this.array;
    }

    get size(): number {
        return this.index.size;
    }
}
