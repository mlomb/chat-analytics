import { BitStream } from "@pipeline/report/BitStream";
import {
    MessageBitConfig,
    readIntermediateMessage,
    writeIntermediateMessage,
} from "@pipeline/report/serialization/MessageSerialization";
import { Index, IntermediateMessage } from "@pipeline/Types";
import { readIndexArray, writeIndexArray } from "@pipeline/report/serialization/IndexSerialization";

describe("index serialization", () => {
    // prettier-ignore
    const cases: { case: [Index, number][] }[] = [
        { case: [[0, 1]] },
        { case: [[0, 2]] },
        { case: [[0, 3]] },
        { case: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]] },
        { case: [[0, 1], [1, 1], [2, 2], [3, 3], [4, 4]] },
    ];

    function processArr(arr: [Index, number][]) {
        const stream = new BitStream();
        stream.offset = 0;
        writeIndexArray(arr, stream, 16);
        stream.offset = 0;
        return readIndexArray(stream, 16);
    }

    test.each(cases)("should read and write correctly $case", (t) => {
        const got = processArr(t.case);
        expect(got).toStrictEqual(t.case);
    });

    test("should overflow total with direct encoding", () => {
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
            hour: 4,
            authorId: 5,
        },
        {
            day: 123,
            hour: 4,
            authorId: 5,
            sentiment: 6,
            lang: 7,
            words: [
                [8, 9],
                [10, 11],
            ],
        },
        // prettier-ignore
        {
            day: 123,
            hour: 4,
            authorId: 5,
            sentiment: 6,
            lang: 7,
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
        authorIdBits: 8,
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
