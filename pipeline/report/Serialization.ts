import { IntermediateMessage, Message } from "@pipeline/Types";
import { BitStream } from "@pipeline/report/BitStream";

export const writeIntermediateMessage = (message: IntermediateMessage, stream: BitStream) => {
    stream.setBits(32, Math.floor(message.timestamp / 1000));
    stream.setBits(32, message.authorId);
    stream.setBits(8, message.langIdx);
    stream.setBits(8, message.sentiment);
    stream.setBits(8, message.words.length);
    for (const [word, count] of message.words) {
        stream.setBits(16, word);
        stream.setBits(8, count);
    }
};

export const readIntermediateMessage = (stream: BitStream): IntermediateMessage => {
    const imsg: IntermediateMessage = {
        timestamp: stream.getBits(32) * 1000,
        authorId: stream.getBits(32),
        langIdx: stream.getBits(8),
        sentiment: stream.getBits(8),
        words: [],
    };
    const numWords = stream.getBits(8);
    for (let i = 0; i < numWords; i++) {
        imsg.words.push([stream.getBits(16), stream.getBits(8)]);
    }
    return imsg;
};

export interface MessageBitConfig {
    dayIndex: number;
}

export const writeMessage = (message: Message, stream: BitStream, config: MessageBitConfig) => {
    stream.setBits(message.dayIndex, config.dayIndex);
};

export const readMessage = (stream: BitStream, config: MessageBitConfig): Message => {
    return {} as Message;
};
