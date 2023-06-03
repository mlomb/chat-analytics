// In V8, the maximum size of a Map is 2^24
const MAX_MAP_SIZE = Math.pow(2, 24) - 1; // (-1 just in case)

/**
 * A Map that can grow beyond the map size limit using multiple maps.
 */
class BigMap<K, V> {
    private maps: Map<K, V>[] = [new Map()];

    private get lastMap() {
        return this.maps[this.maps.length - 1];
    }

    set(key: K, value: V) {
        if (this.lastMap.size >= MAX_MAP_SIZE) {
            this.maps.push(new Map());
        }
        this.lastMap.set(key, value);
    }

    get(key: K): V | undefined {
        // go backwards to ensure that the most recent values are returned first
        for (let i = this.maps.length - 1; i >= 0; i--) {
            const value = this.maps[i].get(key);
            if (value !== undefined) {
                return value;
            }
        }
        return undefined;
    }

    // TODO: add more functionality as needed
}
