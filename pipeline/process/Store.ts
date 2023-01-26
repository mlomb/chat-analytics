import { RawID, Timestamp } from "@pipeline/Types";

/**
 * This class is responsible to keep the most up-to-date information about a given entry.
 */
export class Store<T extends { id: RawID }> {
    private data = new Map<RawID, T>();

    /** Stores an entry. If an entry with the same ID already exists, it will keep the one with highest `at` value */
    store(value: T, at?: Timestamp) {
        // TODO: use at...

        this.data.set(value.id, value);
    }

    get size(): number {
        return this.data.size;
    }
}
