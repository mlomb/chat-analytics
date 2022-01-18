import { Index } from "@pipeline/Types";

export class IndexedData<K extends string | number, T> {
    private nextIndex: Index = 0;
    private array: T[] = [];
    private mappings: Map<K, Index> = new Map();

    get data(): T[] {
        return this.array;
    }

    get size(): number {
        return this.nextIndex;
    }

    public has(key: K): boolean {
        return this.mappings.has(key);
    }

    public get(index: Index): T {
        return this.array[index];
    }

    public getIndex(key: K): Index | undefined {
        return this.mappings.get(key);
    }

    // the key must not already exist
    public set(key: K, value: T): Index {
        // TODO: remove this check
        console.assert(!this.has(key));

        const index = this.nextIndex++;
        this.array[index] = value;
        this.mappings.set(key, index);
        return index;
    }

    public setAt(index: Index, value: T) {
        this.array[index] = value;
    }
}
