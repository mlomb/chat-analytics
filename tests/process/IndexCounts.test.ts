import { IndexCounts, IndexCountsBuilder } from "@pipeline/process/IndexCounts";

it("should count and sort correctly", () => {
    const counts = new IndexCountsBuilder();
    counts.incr(3, 3);
    counts.incr(2);
    counts.incr(1, 2);
    expect(counts.toArray()).toStrictEqual([
        [3, 3],
        [1, 2],
        [2, 1],
    ]);
});

it("should count correctly creating from list", () => {
    expect(IndexCountsBuilder.fromList([1, 4, 4, 1, 2, 4]).toArray()).toStrictEqual([
        [4, 3],
        [1, 2],
        [2, 1],
    ]);
});
