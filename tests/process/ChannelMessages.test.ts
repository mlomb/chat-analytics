import { ChannelMessages } from "@pipeline/process/ChannelMessages";
import { Message } from "@pipeline/process/Types";

const makeMessage = (i: number, authorId: number = 0) => ({ id: i, authorId, channelId: 1, timestamp: i });

it("should wait for EOF before processing last messages", () => {
    const fn = jest.fn((group) => [...group] as Message[]);
    const cm = new ChannelMessages();

    cm.addMessage(makeMessage(1, 0));
    cm.addMessage(makeMessage(2, 1));
    cm.addMessage(makeMessage(3, 1));
    cm.process(fn);
    expect(fn).toHaveBeenCalledWith([makeMessage(1, 0)]); // should not process last two messages (more messages from the same author may appear)
    fn.mockClear();
    cm.markEOF(); // mark end of file, so it know no more messages will be added
    cm.process(fn); // process all remaining messages
    expect(fn).toHaveBeenCalledWith([makeMessage(2, 1), makeMessage(3, 1)]);
});

describe("duplicate messages", () => {
    let cm: ChannelMessages;
    let fn: jest.Mock;

    beforeEach(() => {
        fn = jest.fn((group) => [...group] as Message[]);
        cm = new ChannelMessages();
        cm.addMessage(makeMessage(10));
        cm.addMessage(makeMessage(11));
        cm.addMessage(makeMessage(12));
        cm.addMessage(makeMessage(13));
        cm.markEOF();
        expect(cm.numMessages).toBe(4);
    });

    it("should not insert overlapping at left", () => {
        cm.addMessage(makeMessage(8));
        cm.addMessage(makeMessage(9));
        cm.addMessage(makeMessage(10)); // duplicate
        cm.addMessage(makeMessage(11)); // duplicate
        expect(cm.numMessages).toBe(6);
        cm.markEOF();
        cm.process(fn);
        expect(cm.numMessages).toBe(6);
    });

    it("should not insert overlapping at right", () => {
        cm.addMessage(makeMessage(12)); // duplicate
        cm.addMessage(makeMessage(13)); // duplicate
        cm.addMessage(makeMessage(14));
        cm.addMessage(makeMessage(15));
        expect(cm.numMessages).toBe(6);
        cm.markEOF();
        cm.process(fn);
        expect(cm.numMessages).toBe(6);
    });
});

// expect(fn).toHaveBeenCalledWith([10, 11, 12, 13, 14, 15].map((i) => makeMessage(i)));
