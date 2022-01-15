import { BitStream } from "@pipeline/serialization/BitStream";
import {
    MessageBitConfig,
    readIntermediateMessage,
    writeIntermediateMessage,
} from "@pipeline/serialization/MessageSerialization";
import { Index, IntermediateMessage } from "@pipeline/Types";
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
        { case: [[0, 1], [1, 1], [2, 1]] },
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

    test.each(cases)("should read and write correctly $case", (t) => {
        const got = processArr(t.case);
        equivalent(got, t.case);
    });

    test("should overflow total with serial encoding", () => {
        const got = processArr(new Array(20000).fill([0, 1]));
        // some must be lost
        expect(got.length).toBeGreaterThan(0);
        expect(got.length).toBeLessThan(20000);
    });

    test("should overflow length with RLE", () => {
        const got = processArr(new Array(500).fill([0, 65000]));
        // some must be lost
        expect(got.length).toBeGreaterThan(0);
        expect(got.length).toBeLessThan(500);
    });
});

describe("obj -> (serialize) -> (deserialize) -> obj", () => {
    let obj: IntermediateMessage;

    const cases: IntermediateMessage[] = [
        {
            day: 123,
            secondOfDay: 4,
            authorIndex: 5,
            langIndex: 6,
            sentiment: 7,
        },
        {
            day: 123,
            secondOfDay: 4,
            authorIndex: 5,
            langIndex: 6,
            sentiment: 7,
            words: [
                [8, 9],
                [10, 11],
            ],
        },
        // prettier-ignore
        {
            day: 123,
            secondOfDay: 4,
            authorIndex: 5,
            langIndex: 6,
            sentiment: 7,
            words: [[8, 1], [10, 2]],
            emojis: [[12, 3], [14, 4], [16, 5]],
            mentions: [[30, 1], [32, 2], [34, 3]],
            reactions: [[24, 4], [26, 5], [28, 1]],
            domains: [[36, 2], [38, 3], [40, 4]],
            attachments: [[0, 5], [1, 1], [2, 2]],
        },
    ];

    test.each(cases)("%p", (_obj) => {
        obj = _obj;
    });

    const bitConfig: MessageBitConfig = {
        dayBits: 8,
        authorIdxBits: 8,
        wordIdxBits: 8,
        emojiIdxBits: 8,
        mentionsIdxBits: 8,
        domainsIdxBits: 8,
    };

    afterEach(() => {
        const stream = new BitStream();
        stream.offset = 0;
        writeIntermediateMessage(obj, stream, bitConfig);
        stream.offset = 0;
        const gotObj = readIntermediateMessage(stream, bitConfig);
        expect(gotObj).toStrictEqual(obj);
    });
});
