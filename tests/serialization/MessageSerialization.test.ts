import { Message } from "@pipeline/Types";
import { BitStream } from "@pipeline/serialization/BitStream";
import { MessageBitConfig, readMessage, writeMessage } from "@pipeline/serialization/MessageSerialization";

describe("obj -> (serialize) -> (deserialize) -> obj", () => {
    let obj: Message;

    const cases: Message[] = [
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
        writeMessage(obj, stream, bitConfig);
        stream.offset = 0;
        const gotObj = readMessage(stream, bitConfig);
        expect(gotObj).toStrictEqual(obj);
    });
});
