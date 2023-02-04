import { BitStream } from "@pipeline/serialization/BitStream";
import { DefaultMessageBitConfig, writeMessage } from "@pipeline/serialization/MessageSerialization";
import { MessageView } from "@pipeline/serialization/MessageView";

import { MESSAGE_KEYS, SAMPLE_MESSAGES } from "./Common";

describe("should deserialize correctly", () => {
    test.each(SAMPLE_MESSAGES)("%p", (message) => {
        const stream = new BitStream();
        writeMessage(message, stream, DefaultMessageBitConfig);
        stream.offset = 0;

        const view = new MessageView(stream, DefaultMessageBitConfig);

        for (const key of MESSAGE_KEYS) {
            expect(view[key]).toStrictEqual(message[key]);
        }

        expect(view.getFullMessage()).toMatchObject(message);
    });
});

it("should link replies correctly", () => {
    const stream = new BitStream();

    let offsetOfSecondMessage = 0;
    for (let i = 0; i < SAMPLE_MESSAGES.length; i++) {
        if (i === 1) offsetOfSecondMessage = stream.offset;
        writeMessage(SAMPLE_MESSAGES[i], stream, DefaultMessageBitConfig);
    }

    let offsetOfTestMessage = stream.offset;
    writeMessage(
        {
            dayIndex: 1,
            secondOfDay: 2,
            authorIndex: 3,
            langIndex: 4,
            sentiment: 5,
            replyOffset: offsetOfSecondMessage,
        },
        stream,
        DefaultMessageBitConfig
    );

    stream.offset = offsetOfTestMessage;
    const view = new MessageView(stream, DefaultMessageBitConfig);

    expect(view.hasReply).toBeTruthy();
    expect(view.replyOffset).toBe(offsetOfSecondMessage);
    expect(view.reply).toBeDefined();
    expect(view.reply!.getFullMessage()).toMatchObject(SAMPLE_MESSAGES[1]);
    expect(view.reply!.reply).toBeUndefined();
});
