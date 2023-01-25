import { Index } from "@pipeline/Types";
import { BitStream } from "@pipeline/serialization/BitStream";
import { readIndexArray, writeIndexArray } from "@pipeline/serialization/IndexSerialization";

describe("index serialization", () => {
    // prettier-ignore
    const cases: { case: [Index, number][] }[] = [
        // single
        { case: [[0, 1]] },
        // double
        { case: [[0, 1], [1, 1]] },
        // double combined
        { case: [[0, 1], [0, 1]] },
        // serial
        { case: [[0, 1], [1, 1], [2, 1]] }, // (!)
        // big serial
        { case: [[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1],[12,1],[13,1],[14,1],[15,1]] },
        // rle
        { case: [[0, 100], [1, 100], [2, 100], [3, 100]] },
    ];

    function processArr(arr: [Index, number][]) {
        const stream = new BitStream();
        stream.offset = 0;
        writeIndexArray(arr, stream, 16);
        stream.offset = 0;
        return readIndexArray(stream, 16);
    }

    function equivalent(arr1: [Index, number][], arr2: [Index, number][]) {
        const counts1: any = {},
            counts2: any = {};
        for (const [idx, count] of arr1) counts1[idx] = (counts1[idx] || 0) + count;
        for (const [idx, count] of arr2) counts2[idx] = (counts2[idx] || 0) + count;

        expect(Object.keys(counts1).sort()).toStrictEqual(Object.keys(counts2).sort());
        for (const idx in counts1) expect(counts1[idx]).toStrictEqual(counts2[idx]);
    }

    it.each(cases)("should read and write correctly $case", (t) => {
        const got = processArr(t.case);
        equivalent(got, t.case);
    });

    it("should overflow total with serial encoding", () => {
        const got = processArr(new Array(20000).fill([0, 1]));
        // some must be lost
        expect(got.length).toBeGreaterThan(0);
        expect(got.length).toBeLessThan(20000);
    });

    it("should overflow length with RLE", () => {
        const got = processArr(new Array(500).fill([0, 65000]));
        // some must be lost
        expect(got.length).toBeGreaterThan(0);
        expect(got.length).toBeLessThan(500);
    });
});
