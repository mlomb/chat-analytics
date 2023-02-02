import { Message } from "@pipeline/process/Types";
import { BitStream } from "@pipeline/serialization/BitStream";
import { MessageBitConfig, readMessage, writeMessage } from "@pipeline/serialization/MessageSerialization";

/**
 * Acts just like an array, but it serializes the messages to a BitStream to improve memory usage and performance.
 *
 * It needs a `MessageBitConfig` to know the bit configuration of the messages.
 */
export class MessagesArray implements Iterable<Message> {
    /** The stream where messages are written of read from */
    public stream: BitStream;

    /**
     * The number of messages in the array.
     * We have to store this value separately, since otherwise we would have to iterate over all the messages to get the length.
     */
    public length: number;

    /** Creates an empty array, ready for writing */
    constructor(bitConfig: MessageBitConfig);

    /**
     * Creates an array from an existing stream.
     *
     * @param count the number of messages in the stream
     */
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

    /** Adds a message at the end */
    push(item: Message) {
        writeMessage(item, this.stream, this.bitConfig);
        this.length++;
    }

    /**
     *  Iterates over all messages in the array.
     *
     * ⚠️ You can't call this method and push messages at the same time, since we are changing the stream offset.
     */
    *[Symbol.iterator]() {
        // save and later restore the current stream offset
        const originalOffset = this.stream.offset;
        this.stream.offset = 0; // start from the beginning

        for (let i = 0; i < this.length; i++) {
            yield readMessage(this.stream, this.bitConfig);
        }

        this.stream.offset = originalOffset;
    }
}
