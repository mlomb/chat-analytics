import { Message } from "@pipeline/process/Types";
import { BitStream } from "@pipeline/serialization/BitStream";
import { DefaultMessageBitConfig, writeMessage } from "@pipeline/serialization/MessageSerialization";
import { MessagesArray } from "@pipeline/serialization/MessagesArray";

const TEST_MESSAGES: Message[] = [
    {
        dayIndex: 123,
        secondOfDay: 4,
        authorIndex: 8,
    },
    {
        dayIndex: 321,
        secondOfDay: 4,
        authorIndex: 8,
    },
];

test("push elements and be able to iterate them", () => {
    const arr = new MessagesArray(DefaultMessageBitConfig);
    const gotArr: Message[] = [];

    for (const item of TEST_MESSAGES) arr.push(item);
    for (const item of arr) gotArr.push(item);

    expect(gotArr).toStrictEqual(TEST_MESSAGES);
});

test("iterate from existing stream", () => {
    const stream = new BitStream();
    for (const item of TEST_MESSAGES) writeMessage(item, stream, DefaultMessageBitConfig);

    stream.offset = 0;
    const arr = new MessagesArray(DefaultMessageBitConfig, stream, TEST_MESSAGES.length);
    const gotArr: Message[] = [];
    for (const item of arr) gotArr.push(item);

    expect(gotArr).toStrictEqual(TEST_MESSAGES);
});

it("should throw if count is not provided", () => {
    expect(() => new MessagesArray(DefaultMessageBitConfig, new BitStream())).toThrow();
});
