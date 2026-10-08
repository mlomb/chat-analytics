import { BitStream } from "@pipeline/serialization/BitStream";
import { DefaultMessageBitConfig, readMessage, writeMessage } from "@pipeline/serialization/MessageSerialization";
import { MessageView } from "@pipeline/serialization/MessageView";
import { decodeSentiment, encodeSentiment } from "@pipeline/serialization/SentimentSerialization";

test.each([
    [undefined, undefined],
    [NaN, undefined],
    [Infinity, undefined],
    [-Infinity, undefined],
    [0, 0],
    [3, 3],
    [-3, -3],
    [0.01, 1],
    [-0.01, -1],
    [0.9, 1],
    [-0.9, -1],
    [1.2, 2],
    [-1.2, -2],
    [127, 127],
    [-127, -127],
    [1000, 127],
    [-1000, -127],
])("preserves score availability and polarity through both readers: %p", (score, expected) => {
    const stream = new BitStream();
    writeMessage(
        { dayIndex: 1, secondOfDay: 2, authorIndex: 3, langIndex: 4, sentiment: score },
        stream,
        DefaultMessageBitConfig
    );
    stream.offset = 0;
    expect(readMessage(stream, DefaultMessageBitConfig).sentiment).toBe(expected);
    stream.offset = 0;
    expect(new MessageView(stream, DefaultMessageBitConfig).sentiment).toBe(expected);
});

it("distinguishes the legacy missing-score byte from a balanced score", () => {
    // Previously undefined produced NaN, which bitwise encoding stored as byte zero.
    expect(encodeSentiment(undefined)).toBe(0);
    expect(decodeSentiment(0)).toBeUndefined();
    expect(encodeSentiment(0)).toBe(128);
    expect(decodeSentiment(128)).toBe(0);
    expect(decodeSentiment(127)).toBe(-1);
    expect(decodeSentiment(129)).toBe(1);
});
