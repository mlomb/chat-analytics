import { PMessage } from "@pipeline/parse/Types";
import { ChannelMessages, MessagesInterval } from "@pipeline/process/ChannelMessages";
import { Message } from "@pipeline/process/Types";

const makePMessage = (i: number, authorId: number = 0) => ({ id: i, authorId, channelId: 1, timestamp: i });
const processFn: (m: PMessage) => Message = (m) => ({ dayIndex: 0, secondOfDay: 0, authorIndex: m.authorId as number });

it("should wait for EOF before processing last messages", () => {
    const fn = jest.fn((group) => group.map(processFn));
    const cm = new ChannelMessages();

    cm.addMessage(makePMessage(1, 0));
    cm.addMessage(makePMessage(2, 1));
    cm.addMessage(makePMessage(3, 1));
    cm.process(fn);
    expect(fn).toHaveBeenCalledWith([makePMessage(1, 0)]); // should not process last two messages (more messages from the same author may appear)
    fn.mockClear();
    cm.markEOF(); // mark end of file, so it know no more messages will be added
    cm.process(fn); // process all remaining messages
    cm.process(fn); // show not process anything
    expect(fn).toHaveBeenCalledWith([makePMessage(2, 1), makePMessage(3, 1)]);
});

describe("duplicate messages", () => {
    let cm: ChannelMessages;
    let fn: jest.Mock;

    beforeEach(() => {
        fn = jest.fn((group) => group.map(processFn));
        cm = new ChannelMessages();
        cm.addMessage(makePMessage(10));
        cm.addMessage(makePMessage(11));
        cm.addMessage(makePMessage(12));
        cm.addMessage(makePMessage(13));
        cm.markEOF();
        expect(cm.numMessages).toBe(4);
    });

    it("should not insert overlapping at left", () => {
        cm.addMessage(makePMessage(8));
        cm.addMessage(makePMessage(9));
        cm.addMessage(makePMessage(10)); // duplicate
        cm.addMessage(makePMessage(11)); // duplicate
        expect(cm.numMessages).toBe(6);
        cm.markEOF();
        cm.process(fn);
        expect(cm.numMessages).toBe(6);
    });

    it("should not insert overlapping at right", () => {
        cm.addMessage(makePMessage(12)); // duplicate
        cm.addMessage(makePMessage(13)); // duplicate
        cm.addMessage(makePMessage(14));
        cm.addMessage(makePMessage(15));
        expect(cm.numMessages).toBe(6);
        cm.markEOF();
        cm.process(fn);
        expect(cm.numMessages).toBe(6);
    });

    it("should not insert totally contained", () => {
        cm.addMessage(makePMessage(11)); // duplicate
        cm.addMessage(makePMessage(12)); // duplicate
        expect(cm.numMessages).toBe(4);
    });

    it("should skip duplicates if it is bigger in both sides", () => {
        cm.addMessage(makePMessage(8));
        cm.addMessage(makePMessage(9));
        cm.addMessage(makePMessage(10)); // duplicate
        cm.addMessage(makePMessage(11)); // duplicate
        cm.addMessage(makePMessage(12)); // duplicate
        cm.addMessage(makePMessage(13)); // duplicate
        cm.addMessage(makePMessage(14));
        cm.addMessage(makePMessage(15));
        expect(cm.numMessages).toBe(8);
    });
});

describe("complex sample", () => {
    let cm: ChannelMessages;
    let fn: jest.Mock;
    const expected = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    beforeEach(() => {
        cm = new ChannelMessages();
        cm.addMessage(makePMessage(10));
        cm.addMessage(makePMessage(11));
        cm.addMessage(makePMessage(12));
        cm.markEOF();
        cm.addMessage(makePMessage(7));
        cm.addMessage(makePMessage(8));
        cm.addMessage(makePMessage(9));
        cm.addMessage(makePMessage(10));
        cm.markEOF();
        cm.addMessage(makePMessage(9));
        cm.addMessage(makePMessage(10));
        cm.addMessage(makePMessage(11));
        cm.addMessage(makePMessage(12));
        cm.addMessage(makePMessage(13));
        cm.addMessage(makePMessage(14));
        cm.markEOF();
        cm.addMessage(makePMessage(13));
        cm.addMessage(makePMessage(14));
        cm.addMessage(makePMessage(15));
        cm.markEOF();
        cm.addMessage(makePMessage(6));
        cm.addMessage(makePMessage(7));
        cm.addMessage(makePMessage(8));
        cm.markEOF();

        fn = jest.fn((group) => group.map(processFn));
        cm.process(fn);
    });

    it("number of messages are as expected", () => {
        expect(cm.numMessages).toBe(expected.length);
    });

    it("should call processing on all messages", () => {
        expect(fn.mock.calls.reduce((acum, call) => acum + call[0].length, 0)).toBe(expected.length);
    });

    it("indexOf is correct", () => {
        for (let k = 6; k <= 15; k++) {
            expect(cm.indexOf(k)).toBe(k - 6);
        }
        expect(cm.indexOf(69)).toBe(undefined);
    });

    it("iteration should return all elements", () => {
        expect(Array.from(cm.processedMessages())).toStrictEqual(expected.map((i) => processFn(makePMessage(i))));
    });
});

it("should crash if interval is extended into the past", () => {
    const interval = new MessagesInterval(makePMessage(69));
    expect(() => interval.addMessageAndExtend(makePMessage(68))).toThrow(
        "MessagesInterval can only be extended to the future"
    );
});
