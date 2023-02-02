import { Message } from "@pipeline/process/Types";
import { BitStream } from "@pipeline/serialization/BitStream";
import { MessageBitConfig, readMessage, writeMessage } from "@pipeline/serialization/MessageSerialization";

/**
 * Acts just like an array, but it serializes the messages to a BitStream to save memory and improve performance.
 */
export class MessagesArray implements Iterable<Message> {
    /** */
    public stream: BitStream;

    /** */
    public length: number;

    constructor(bitConfig: MessageBitConfig);
    constructor(public readonly bitConfig: MessageBitConfig, stream?: BitStream, count?: number) {
        if (stream) {
            if (count === undefined) throw new Error("Count is required");

            this.stream = stream;
            this.length = count;
        } else {
            // empty
            this.stream = new BitStream();
            this.length = 0;
        }
    }

    push(item: Message) {
        writeMessage(item, this.stream, this.bitConfig);
        this.length++;
    }

    *[Symbol.iterator]() {
        // save and later restor the current stream offset
        const originalOffset = this.stream.offset;
        this.stream.offset = 0;

        for (let i = 0; i < this.length; i++) {
            yield readMessage(this.stream, this.bitConfig);
        }

        this.stream.offset = originalOffset;
    }
}
