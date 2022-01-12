import { Index, IntermediateMessage, Message } from "@pipeline/Types";
import { BitStream } from "@pipeline/report/BitStream";
import { Day } from "@pipeline/Time";

// available message information
// prettier-ignore
export enum MessageFlags {
    None,
    Reply       = 1 << 0,
    Edited      = 1 << 1,
    Text        = 1 << 2,
    Emojis      = 1 << 3,
    Attachments = 1 << 4,
    Reactions   = 1 << 5,
    Mentions    = 1 << 6,
}

const writeCommon = (message: IntermediateMessage, stream: BitStream) => {
    stream.setBits(5, message.hour); // 0-23
    stream.setBits(21, message.authorId); // 0-2097151

    let flags = MessageFlags.None;
    if (message.words?.length) flags |= MessageFlags.Text;
    if (message.emojis?.length) flags |= MessageFlags.Emojis;
    if (message.attachments?.length) flags |= MessageFlags.Attachments;
    if (message.reactions?.length) flags |= MessageFlags.Reactions;
    if (message.mentions?.length) flags |= MessageFlags.Mentions;
    stream.setBits(6, flags);

    if (flags & MessageFlags.Text) {
        stream.setBits(8, message.sentiment!); // 0-255
        stream.setBits(8, message.lang!); // 0-255
        writeCountArray(message.words!, stream);
    }
    if (flags & MessageFlags.Emojis) writeCountArray(message.emojis!, stream);
    if (flags & MessageFlags.Attachments) writeCountArray(message.attachments!, stream);
    if (flags & MessageFlags.Reactions) writeCountArray(message.reactions!, stream);
    if (flags & MessageFlags.Mentions) writeCountArray(message.mentions!, stream);
};

const writeCountArray = (counts: [Index, number][], stream: BitStream) => {
    // TODO: two formats
    stream.setBits(8, counts.length); // 0-255
    for (const [e, count] of counts) {
        stream.setBits(16, e);
        stream.setBits(4, count);
    }
};

export const writeIntermediateMessage = (message: IntermediateMessage, stream: BitStream) => {
    stream.setBits(12, message.day.year); // 0-4095
    stream.setBits(4, message.day.month); // 0-15
    stream.setBits(5, message.day.day); // 0-31
    writeCommon(message, stream);
};

export const readIntermediateMessage = (stream: BitStream): IntermediateMessage => {
    const imsg: IntermediateMessage = {
        day: new Day(stream.getBits(12), stream.getBits(4), stream.getBits(5)),
        hour: stream.getBits(5),
        authorId: stream.getBits(21),
        langIdx: stream.getBits(8),
        sentiment: stream.getBits(8),
        words: [],
    };
    const numWords = stream.getBits(8);
    for (let i = 0; i < numWords; i++) {
        imsg.words.push([stream.getBits(16), stream.getBits(4)]);
    }
    return imsg;
};

export interface MessageBitConfig {
    dayIndexBits: number;
    authorIdBits: number;
    wordIdxBits: number;
}

export const writeMessage = (message: Message, stream: BitStream, config: MessageBitConfig) => {
    stream.setBits(config.dayIndexBits, message.dayIndex);
    stream.setBits(5, message.hour);
    stream.setBits(config.authorIdBits, message.authorId);
    stream.setBits(8, message.langIdx);
    stream.setBits(8, message.sentiment);
    stream.setBits(8, message.words.length);
    for (const [word, count] of message.words) {
        stream.setBits(config.wordIdxBits, word);
        stream.setBits(4, count);
    }
};

export const readMessage = (stream: BitStream, config: MessageBitConfig): Message => {
    const message: Message = {
        dayIndex: stream.getBits(config.dayIndexBits),
        hour: stream.getBits(5),
        authorId: stream.getBits(config.authorIdBits),
        langIdx: stream.getBits(8),
        sentiment: stream.getBits(8),
        words: [],
    };
    const numWords = stream.getBits(8);
    stream.offset += numWords * (config.wordIdxBits + 4);
    /*for (let i = 0; i < numWords; i++) {
        message.words.push([stream.getBits(config.wordIdxBits), stream.getBits(4)]);
    }*/
    return message;
};
