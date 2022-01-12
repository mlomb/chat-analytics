import { CommonMessageFields, Index, IntermediateMessage, Message } from "@pipeline/Types";
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

export interface MessageBitConfig {
    dayIndexBits: number;
    authorIdBits: number;
    wordIdxBits: number;
}

const DefaultBitConfig: MessageBitConfig = {
    dayIndexBits: 32,
    authorIdBits: 32,
    wordIdxBits: 32,
};

const writeCommon = (message: CommonMessageFields, stream: BitStream, config: MessageBitConfig) => {
    stream.setBits(5, message.hour); // 0-23
    stream.setBits(21, message.authorId); // 0-2097151

    let flags = MessageFlags.None;
    if (message.words?.length) flags |= MessageFlags.Text;
    if (message.emojis?.length) flags |= MessageFlags.Emojis;
    if (message.attachments?.length) flags |= MessageFlags.Attachments;
    if (message.reactions?.length) flags |= MessageFlags.Reactions;
    if (message.mentions?.length) flags |= MessageFlags.Mentions;
    stream.setBits(7, flags);

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
    const len = Math.min(counts.length, 255);
    stream.setBits(8, len); // 0-255
    for (let i = 0; i < len; i++) {
        stream.setBits(16, counts[i][0]);
        stream.setBits(4, counts[i][1]);
    }
};

const readCommon = (stream: BitStream, config: MessageBitConfig): CommonMessageFields => {
    const hour = stream.getBits(5);
    const authorId = stream.getBits(21);
    const flags = stream.getBits(7);

    const message: CommonMessageFields = {
        hour,
        authorId,
    };

    if (flags & MessageFlags.Text) {
        message.sentiment = stream.getBits(8);
        message.lang = stream.getBits(8);
        message.words = readCountArray(stream);
    }
    if (flags & MessageFlags.Emojis) message.emojis = readCountArray(stream);
    if (flags & MessageFlags.Attachments) message.attachments = readCountArray(stream);
    if (flags & MessageFlags.Reactions) message.reactions = readCountArray(stream);
    if (flags & MessageFlags.Mentions) message.mentions = readCountArray(stream);

    return message;
};

const readCountArray = (stream: BitStream): [Index, number][] => {
    const count = stream.getBits(8);
    const result: [Index, number][] = [];
    for (let i = 0; i < count; i++) {
        result.push([stream.getBits(16), stream.getBits(4)]);
    }
    return result;
};

export const writeIntermediateMessage = (message: IntermediateMessage, stream: BitStream) => {
    stream.setBits(12, message.day.year); // 0-4095
    stream.setBits(4, message.day.month); // 0-15
    stream.setBits(5, message.day.day); // 0-31
    writeCommon(message, stream, DefaultBitConfig);
};

export const readIntermediateMessage = (stream: BitStream): IntermediateMessage => {
    return {
        day: new Day(stream.getBits(12), stream.getBits(4), stream.getBits(5)),
        ...readCommon(stream, DefaultBitConfig),
    };
};

export const writeMessage = (message: Message, stream: BitStream, config: MessageBitConfig) => {
    stream.setBits(config.dayIndexBits, message.dayIndex);
    writeCommon(message, stream, config);
};

export const readMessage = (stream: BitStream, config: MessageBitConfig): Message => {
    return {
        dayIndex: stream.getBits(config.dayIndexBits),
        ...readCommon(stream, config),
    };
};
