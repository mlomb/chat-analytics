import { IndexedMap } from "@pipeline/process/IndexedMap";

it("should set and get and preserve insertion order", () => {
    const map = new IndexedMap<string, number>();

    map.set("a", 10);
    map.set("b", 20);
    map.set("c", 30);

    expect(map.getIndex("a")).toBe(0);
    expect(map.getIndex("b")).toBe(1);
    expect(map.getIndex("c")).toBe(2);
    expect(map.getIndex("d")).toBe(undefined);
    expect(map.getByIndex(0)).toBe(10);
    expect(map.getByIndex(1)).toBe(20);
    expect(map.getByIndex(2)).toBe(30);
    expect(map.values).toEqual([10, 20, 30]);
    expect(map.size).toBe(3);
});

it("should keep the most up-to-date value", () => {
    const map = new IndexedMap<string, number>();

    map.set("a", 10);
    map.set("a", 30, 3);
    map.set("a", 50, 5);
    map.set("a", 10, 1);

    expect(map.getByIndex(map.getIndex("a")!)).toBe(50);
});
