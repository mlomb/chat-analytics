import { IntermediateMessage, Message } from "@pipeline/Types";
import { BitStream } from "@pipeline/report/BitStream";

export const writeIntermediateMessage = (message: IntermediateMessage, stream: BitStream) => {
    stream.setBits(12, message.year); // 0-4095
    stream.setBits(4, message.month); // 0-15
    stream.setBits(5, message.day); // 0-31
    stream.setBits(5, message.hour); // 0-23
    stream.setBits(21, message.authorId); // 0-2097151
    stream.setBits(8, message.langIdx); // 0-255
    stream.setBits(8, message.sentiment); // 0-255
    stream.setBits(8, message.words.length); // 0-255
    for (const [word, count] of message.words) {
        stream.setBits(16, word);
        stream.setBits(4, count);
    }
};

export const readIntermediateMessage = (stream: BitStream): IntermediateMessage => {
    const imsg: IntermediateMessage = {
        year: stream.getBits(12),
        month: stream.getBits(4),
        day: stream.getBits(5),
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
