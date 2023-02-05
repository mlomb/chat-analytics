import { BitStream } from "@pipeline/serialization/BitStream";
import { DefaultMessageBitConfig, readMessage, writeMessage } from "@pipeline/serialization/MessageSerialization";

import { SAMPLE_MESSAGES } from "@tests/serialization/Common";

describe("obj -> (serialize) -> (deserialize) -> obj", () => {
    test.each(SAMPLE_MESSAGES)("%p", (message) => {
        const stream = new BitStream();
        writeMessage(message, stream, DefaultMessageBitConfig);
        stream.offset = 0;
        const gotObj = readMessage(stream, DefaultMessageBitConfig);
        expect(gotObj).toStrictEqual(message);
    });
});
