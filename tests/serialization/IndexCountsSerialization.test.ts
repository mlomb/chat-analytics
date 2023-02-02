import { Index } from "@pipeline/Types";
import { IndexCounts } from "@pipeline/process/IndexCounts";
import { BitStream } from "@pipeline/serialization/BitStream";
import { readIndexCounts, skipIndexCounts, writeIndexCounts } from "@pipeline/serialization/IndexCountsSerialization";

describe("index serialization", () => {
    // prettier-ignore
    const cases: { name: string; counts: IndexCounts }[] = [
        { name: "single",             counts: [[0, 1]] },
        { name: "double",             counts: [[0, 1],[1, 1]] },
        { name: "double combined",    counts: [[0, 2]] },
        { name: "serial",             counts: [[0, 1],[1, 1],[2, 1]] },
        { name: "serial big",         counts: [[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1],[12,1],[13,1],[14,1],[15,1]] },
        { name: "serial consecutive", counts: [[0,1],[1,1],[1,1],[2,1]] },
        { name: "rle",                counts: [[0, 100],[1, 100],[2, 100],[3, 100]] },
    ];

    function writeThenRead(counts: IndexCounts) {
        const stream = new BitStream();
        writeIndexCounts(counts, stream, 16);
        stream.offset = 0;
        return readIndexCounts(stream, 16);
    }

    function equivalent(arr1: IndexCounts, arr2: IndexCounts) {
        const counts1: any = {},
            counts2: any = {};
        for (const [idx, count] of arr1) counts1[idx] = (counts1[idx] || 0) + count;
        for (const [idx, count] of arr2) counts2[idx] = (counts2[idx] || 0) + count;

        expect(Object.keys(counts1).sort()).toStrictEqual(Object.keys(counts2).sort());
        for (const idx in counts1) expect(counts1[idx]).toStrictEqual(counts2[idx]);
    }

    it.each(cases)("should read and write correctly: $name", ({ counts }) => {
        const read = writeThenRead(counts);
        equivalent(read, counts);
    });

    it.each(cases)("skip the correct amount of bytes: $name", ({ counts }) => {
        const stream = new BitStream();
        writeIndexCounts(counts, stream, 16);
        const length = stream.offset;
        stream.offset = 0;
        skipIndexCounts(stream, 16);
        expect(stream.offset).toStrictEqual(length);
    });

    it("should overflow total with serial encoding", () => {
        const got = writeThenRead(new Array(20000).fill([0, 1]));
        // some must be lost
        expect(got.length).toBeGreaterThan(0);
        expect(got.length).toBeLessThan(20000);
    });

    it("should overflow length with RLE", () => {
        const got = writeThenRead(new Array(500).fill([0, 65000]));
        // some must be lost
        expect(got.length).toBeGreaterThan(0);
        expect(got.length).toBeLessThan(500);
    });
});
