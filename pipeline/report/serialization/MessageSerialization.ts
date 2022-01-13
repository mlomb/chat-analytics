import { CommonMessageFields, IntermediateMessage, Message } from "@pipeline/Types";
import { Day } from "@pipeline/Time";
import { BitStream } from "@pipeline/report/BitStream";
import { readIndexArray, writeIndexArray } from "@pipeline/report/serialization/IndexSerialization";

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
    Domains     = 1 << 7,
}

export interface MessageBitConfig {
    dayIndexBits: number;
    authorIdBits: number;
    wordIdxBits: number;
    emojiIdxBits: number;
    mentionsIdxBits: number;
    domainsIdxBits: number;
}

const DefaultBitConfig: MessageBitConfig = {
    dayIndexBits: 0, // not used
    authorIdBits: 21,
    wordIdxBits: 21,
    emojiIdxBits: 18,
    mentionsIdxBits: 20,
    domainsIdxBits: 16,
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
    if (message.domains?.length) flags |= MessageFlags.Domains;
    stream.setBits(8, flags);

    if (flags & MessageFlags.Text) {
        stream.setBits(8, message.sentiment!); // 0-255
        stream.setBits(8, message.lang!); // 0-255
        writeIndexArray(message.words!, stream, config.wordIdxBits);
    }
    if (flags & MessageFlags.Emojis) writeIndexArray(message.emojis!, stream, config.emojiIdxBits);
    if (flags & MessageFlags.Attachments) writeIndexArray(message.attachments!, stream, 3);
    if (flags & MessageFlags.Reactions) writeIndexArray(message.reactions!, stream, config.emojiIdxBits);
    if (flags & MessageFlags.Mentions) writeIndexArray(message.mentions!, stream, config.mentionsIdxBits);
    if (flags & MessageFlags.Domains) writeIndexArray(message.domains!, stream, config.domainsIdxBits);
};

const readCommon = (stream: BitStream, config: MessageBitConfig): CommonMessageFields => {
    const hour = stream.getBits(5);
    const authorId = stream.getBits(21);
    const flags = stream.getBits(8);

    const message: CommonMessageFields = {
        hour,
        authorId,
    };

    if (flags & MessageFlags.Text) {
        message.sentiment = stream.getBits(8);
        message.lang = stream.getBits(8);
        message.words = readIndexArray(stream, config.wordIdxBits);
    }
    if (flags & MessageFlags.Emojis) message.emojis = readIndexArray(stream, config.emojiIdxBits);
    if (flags & MessageFlags.Attachments) message.attachments = readIndexArray(stream, 3);
    if (flags & MessageFlags.Reactions) message.reactions = readIndexArray(stream, config.emojiIdxBits);
    if (flags & MessageFlags.Mentions) message.mentions = readIndexArray(stream, config.mentionsIdxBits);
    if (flags & MessageFlags.Domains) message.domains = readIndexArray(stream, config.domainsIdxBits);

    return message;
};

export const writeIntermediateMessage = (message: IntermediateMessage, stream: BitStream) => {
    stream.setBits(12, message.day.year); // 0-4095
    stream.setBits(4, message.day.month); // 0-15
    stream.setBits(5, message.day.day); // 0-31
    writeCommon(message, stream, DefaultBitConfig);
};

export const readIntermediateMessage = (stream: BitStream): IntermediateMessage => {
    const day = new Day(stream.getBits(12), stream.getBits(4), stream.getBits(5));
    const common = readCommon(stream, DefaultBitConfig);
    // avoid unnecessary object creation
    const msg = common as IntermediateMessage;
    msg.day = day;
    return msg;
};

export const writeMessage = (message: Message, stream: BitStream, config: MessageBitConfig) => {
    stream.setBits(config.dayIndexBits, message.dayIndex);
    writeCommon(message, stream, config);
};

export const readMessage = (stream: BitStream, config: MessageBitConfig): Message => {
    const dayIndex = stream.getBits(config.dayIndexBits);
    const common = readCommon(stream, config);
    // avoid unnecessary object creation
    const msg = common as Message;
    msg.dayIndex = dayIndex;
    return msg;
};
