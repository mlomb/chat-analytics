import { Timestamp } from "@pipeline/Types";
import { PMessage } from "@pipeline/parse/Types";
import { IMessage } from "@pipeline/process/Types";

/** A group of raw parser messages that belong to the same author, in the same channel, in chronological order */
export type PMessageGroup = PMessage[];

export type ProcessGroupFn = (group: PMessageGroup) => IMessage[];

/**
 * Responsible for receiving PMessage objects from the parser and
 * generate groups of messages (PMessageGroup) to be processed by the Processor.
 *
 * We want to process messages in groups because it makes more accurate some analysis (lang recognition).
 *
 * The group of messages generated by this class are sent by the same author, in chronological order.
 * Since this class assumes messages received are from the same channel,
 * the groups produced will contain messages from the same channel.
 * This class has to deal with out-of-order (between input files) and duplicated messages.
 * It also assumes that a rogue message will not appear in some time range already covered.
 */
export class ChannelMessages {
    /** All intervals found until now */
    private intervals: MessagesInterval[] = [];

    /** Currently open interval. Next messages will be stored here */
    private openInterval?: MessagesInterval;

    /**
     * Adds a PMessage.
     *
     * ⚠️ WARN ⚠️:
     *   We assume that messages are added in chronological order, unless they are separated by a `markEOF()` call.
     *   We expect this behavior since export files are generated in chronological order
     *   but different files may have different starting times
     */
    addMessage(message: PMessage) {
        // first we have to make sure that extending the open interval will not overlap with other intervals
        for (const interval of this.intervals) {
            if (interval !== this.openInterval && interval.isContained(message.timestamp)) {
                // drop duplicate message, already included in another interval
                return;
            }
        }

        if (this.openInterval) {
            // there is an open interval, we should be able to add this message to it without problems
            this.openInterval.addAndExtend(message);
        } else {
            // create a new interval
            this.openInterval = new MessagesInterval(message);

            // add and make sure intervals are chronologically sorted
            this.intervals.push(this.openInterval);
            this.intervals.sort((a, b) => a.startTimestamp - b.startTimestamp);
        }
    }

    /**
     * Marks the end of an input file.
     *
     * This allows next messages (from other files) to start from any timestamp.
     */
    markEOF() {
        this.openInterval = undefined;
    }

    /**
     *
     */
    process(fn: ProcessGroupFn) {
        for (const interval of this.intervals) {
            interval.process(fn, interval !== this.openInterval);
        }
    }

    *processedMessages(): Generator<IMessage> {
        for (const interval of this.intervals) {
            yield* interval.processedMessages();
        }
    }

    get numMessages() {
        return this.intervals.reduce((acc, i) => acc + i.numMessages, 0);
    }
}

/**
 * An array of messages contained in a time interval.
 */
export class MessagesInterval {
    // [start, end]
    private start: Timestamp;
    private end: Timestamp;

    /** Messages pending to be grouped and processed */
    private messageQueue: PMessage[];

    /** Messages processed */
    private messages: IMessage[] = [];

    constructor(initialMessage: PMessage) {
        this.start = initialMessage.timestamp;
        this.end = initialMessage.timestamp;
        this.messageQueue = [initialMessage];
    }

    /** Adds the PMessage to the queue and extends the end of the interval to contain it */
    addAndExtend(message: PMessage) {
        console.assert(message.timestamp >= this.end, "Intervals can only be extended to the future");

        this.messageQueue.push(message);
        this.end = message.timestamp;
    }

    /**
     * Process the next message group in this interval
     *
     * @param isClosed if true, the interval is considered closed and it won't wait for new messages
     */
    process(fn: ProcessGroupFn, isClosed: boolean) {
        this.messages.push(...fn(this.messageQueue));
        this.messageQueue = [];
    }

    *processedMessages(): Generator<IMessage> {
        for (const m of this.messages) yield m;
    }

    isContained(ts: Timestamp): boolean {
        return this.start <= ts && ts <= this.end;
    }

    get startTimestamp() {
        return this.start;
    }

    get numMessages() {
        return this.messages.length;
    }
}
