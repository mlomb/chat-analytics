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
