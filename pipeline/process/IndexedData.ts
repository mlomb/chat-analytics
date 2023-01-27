import { Index, RawID, Timestamp } from "@pipeline/Types";

/**
 * This class is responsible to keep the most up-to-date information about a given entry.
 */
export class IndexedData<T extends { id: RawID }> {
    private array: T[] = [];
    private index = new Map<RawID, Index>();

    /** Stores an entry. If an entry with the same ID already exists, it will keep the one with highest `at` value */
    store(value: T, at?: Timestamp) {
        // TODO: use at...

        let idx = this.index.get(value.id);
        if (idx === undefined) {
            idx = this.array.length;
            this.index.set(value.id, idx);
        }
        this.array[idx] = value;
    }

    get data(): T[] {
        return this.array;
    }

    get size(): number {
        return this.index.size;
    }
}
