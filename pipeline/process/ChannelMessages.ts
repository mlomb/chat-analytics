import { Index, Timestamp } from "@pipeline/Types";
import { PMessage, RawID } from "@pipeline/parse/Types";
import { Message } from "@pipeline/process/Types";
import { DefaultMessageBitConfig } from "@pipeline/serialization/MessageSerialization";
import { MessagesArray } from "@pipeline/serialization/MessagesArray";

/** A group of raw parser messages that belong to the same author, in the same channel, in chronological order */
export type PMessageGroup = PMessage[];

/** Function to process a group of messages into Message's */
export type ProcessGroupFn = (group: PMessageGroup) => Message[];

/**
 * This class handles all the messages in a channel, either processed or not.
 * Responsible for receiving PMessage objects (parser messages) and generate groups of messages (PMessageGroup)
 * to be processed into Message's
 * We want to process messages in groups because it makes more accurate some analysis (e.g. language recognition).
 * The group of messages generated by this class are sent by the same author, in chronological order.
 *
 * We have to deal with messages from different files (exports) that may have different starting times
 * for the same channel, and even overlapping periods. So this class resolves all that.
 * We have the concept of intervals, where each interval (a @see MessagesInterval instance) stores messages from
 * a starting time to an ending time.
 *
 * ❗ This class assumes that messages are added in chronological order, unless they are separated by a `markEOF()` call.
 * This way it can deal with out-of-order (between `markEOF` calls) and duplicated messages.
 *
 * If a message with a timestamp that is contained in an existing interval is added (but not previously already),
 * it will be dropped (not that common, e.g. different exports with deleted messages)
 *
 * After all the processing is done, processed messages can be iterated via `*processedMessages()` in the
 * correct chronological order.
 *
 * Note: in the future, we may want to process PMessage into IMessage's (some kind of intermediate messages) instead of
 *       just Message, so we can pass intermediate information not needed for the final Message. This will require
 *       refactoring the MessagesArray class.
 */
export class ChannelMessages {
    /** All intervals found until now */
    private intervals: MessagesInterval[] = [];

    /** Currently open interval. Next messages will be stored here */
    private openInterval?: MessagesInterval;

    /**
     * Adds a PMessage to the pending messages to processed in the current open interval.
     * If there is no open interval, a new one will be created with the given message.
     */
    addMessage(message: PMessage) {
        // first we have to make sure that extending the open interval (or a new one) will not overlap with other intervals
        for (const interval of this.intervals) {
            if (interval !== this.openInterval && interval.isContained(message.timestamp)) {
                // drop duplicate message, already included in another interval
                return;
            }
        }

        if (this.openInterval) {
            // there is an open interval, we should be able to add this message to it without problems
            this.openInterval.addMessageAndExtend(message);
        } else {
            // create a new interval
            this.openInterval = new MessagesInterval(message);

            // add and make sure intervals are chronologically sorted
            this.intervals.push(this.openInterval);
            this.intervals.sort((a, b) => a.startTimestamp - b.startTimestamp);
        }
    }

    /**
     * Mark the end of an input file. This allow the next message added (from another file)
     * to have a different starting timestamp.
     *
     * It will close the current open interval, if any. Make sure to call `process` to process leftover messages.
     */
    markEOF() {
        this.openInterval = undefined;
    }

    /**
     * Process as much pending messages as possible. Not all are processed since the current open interval
     * may receive more messages from the same author in the future (remember we are groping them by author).
     */
    process(fn: ProcessGroupFn) {
        for (const interval of this.intervals) interval.process(fn, interval !== this.openInterval);
    }

    /** @returns an iterator over the processed messages */
    *processedMessages() {
        for (const interval of this.intervals) yield* interval.processedMessages();
    }

    /** @returns the index of the message in the correct cronological order. Returns undefined if not found */
    indexOf(id: RawID): Index | undefined {
        let offset = 0;

        for (const interval of this.intervals) {
            const idx = interval.indexOf(id);
            if (idx !== undefined) return offset + idx;
            offset += interval.numMessages;
        }
        return undefined;
    }

    /** @returns the number of messages in this channel */
    get numMessages() {
        return this.intervals.reduce((acc, i) => acc + i.numMessages, 0);
    }
}

/**
 * This class represents a list of messages contained in a time interval.
 * Messages stored here can be either pending to be processed or already processed. (PMessage → Message)
 * Unprocessed messages (PMessage) are added via `addAndExtend(message)`. Eventually you
 * should call `process(fn, isClosed)` to process all pending messages (into Message).
 * The processing is not done by this class and instead you are expected to provide a function to process
 * groups of messages into Message's.
 * These groups of messages are PMessageGroup and are guaranteed to be from the same author, in chronological order.
 * The `isClosed` parameter is used to indicate that the interval is closed and no more messages will be added, to
 * allow process the leftover.
 *
 * It also keeps track of the index of each message by its ID.
 */
export class MessagesInterval {
    // [start, end]
    private start: Timestamp;
    private end: Timestamp;

    /** Messages pending to be grouped and processed. It should be very few elements here at a time */
    private messageQueue: PMessage[] = [];

    /** Messages already processed. */
    private messages = new MessagesArray(DefaultMessageBitConfig);

    /** Mapping between original IDs and its index */
    private idToIndex = new Map<RawID, Index>();

    constructor(initialMessage: PMessage) {
        this.start = initialMessage.timestamp;
        this.end = initialMessage.timestamp;
        this.addMessageAndExtend(initialMessage);
    }

    /** Adds the PMessage to the queue and extends the end of the interval to contain it */
    addMessageAndExtend(message: PMessage) {
        if (message.timestamp < this.end) throw new Error("MessagesInterval can only be extended to the future");

        this.idToIndex.set(message.id, this.numMessages);
        this.messageQueue.push(message);
        this.end = message.timestamp;
    }

    /**
     * Process all the messages in the queue.
     * It will group (by author) them in insertion order and call `fn` for each group,
     * storing the resulting Message as processed messages.
     *
     * @param isClosed if true, the interval is considered closed and it won't wait for new messages, thus processing the leftover
     */
    process(fn: ProcessGroupFn, isClosed: boolean) {
        if (this.messageQueue.length === 0) return;

        const len = this.messageQueue.length;
        let currentAuthor: RawID = this.messageQueue[0].authorId;

        // [ M M M M M M M M ... ]
        //       ↑ l     ↑ r  (a group) [l, r)
        let l = 0,
            r = 1;
        while (r < len) {
            const author = this.messageQueue[r].authorId;
            if (author !== currentAuthor) {
                // process group
                const group = this.messageQueue.slice(l, r);
                for (const m of fn(group)) this.messages.push(m);
                currentAuthor = author;
                l = r;
            }
            r++;
        }

        if (isClosed) {
            // no new messages are expected
            // process last group
            const group = this.messageQueue.slice(l, len);
            for (const m of fn(group)) this.messages.push(m);
            this.messageQueue = [];
        } else {
            // wait for more messages
            this.messageQueue = this.messageQueue.slice(l, len);
        }
    }

    /** @returns an iterator over the processed messages */
    *processedMessages() {
        yield* this.messages;
    }

    /** @returns the index of the message relative to this interval. Returns undefined if not found */
    indexOf(id: RawID): Index | undefined {
        return this.idToIndex.get(id);
    }

    isContained(ts: Timestamp): boolean {
        return this.start <= ts && ts <= this.end;
    }

    get startTimestamp() {
        return this.start;
    }

    /** @returns the total number of messages in the interval */
    get numMessages() {
        return this.messageQueue.length + this.messages.length;
    }
}
