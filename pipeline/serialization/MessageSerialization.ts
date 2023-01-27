import { Message } from "@pipeline/process/Types";
import { BitStream } from "@pipeline/serialization/BitStream";
import { readIndexArray, writeIndexArray } from "@pipeline/serialization/IndexSerialization";

// available message information
// prettier-ignore
export enum MessageFlags {
    None,
    Reply       = 1 << 0,
    Edited      = 1 << 1,
    Text        = 1 << 2,
    Words       = 1 << 3,
    Emojis      = 1 << 4,
    Attachments = 1 << 5,
    Reactions   = 1 << 6,
    Mentions    = 1 << 7,
    Domains     = 1 << 8,
}

export interface MessageBitConfig {
    dayBits: number;
    authorIdxBits: number;
    wordIdxBits: number;
    emojiIdxBits: number;
    mentionsIdxBits: number;
    domainsIdxBits: number;
}

export const writeMessage = (message: Message, stream: BitStream, config: MessageBitConfig) => {
    stream.setBits(config.dayBits, message.day);
    stream.setBits(17, message.secondOfDay); // 0-2^17 (needed 86400)
    stream.setBits(config.authorIdxBits, message.authorIndex);

    let flags = MessageFlags.None;
    if (message.replyOffset) flags |= MessageFlags.Reply;
    if (message.langIndex !== undefined) flags |= MessageFlags.Text;
    if (message.words?.length) flags |= MessageFlags.Words;
    if (message.emojis?.length) flags |= MessageFlags.Emojis;
    if (message.attachments?.length) flags |= MessageFlags.Attachments;
    if (message.reactions?.length) flags |= MessageFlags.Reactions;
    if (message.mentions?.length) flags |= MessageFlags.Mentions;
    if (message.domains?.length) flags |= MessageFlags.Domains;
    stream.setBits(9, flags);

    if (flags & MessageFlags.Reply) stream.setBits(10, message.replyOffset!); // 1024
    if (flags & MessageFlags.Text) {
        stream.setBits(8, message.langIndex!); // 0-255
        stream.setBits(8, message.sentiment! + 128); // 0-255
    }
    if (flags & MessageFlags.Words) writeIndexArray(message.words!, stream, config.wordIdxBits);
    if (flags & MessageFlags.Emojis) writeIndexArray(message.emojis!, stream, config.emojiIdxBits);
    if (flags & MessageFlags.Attachments) writeIndexArray(message.attachments!, stream, 3);
    if (flags & MessageFlags.Reactions) writeIndexArray(message.reactions!, stream, config.emojiIdxBits);
    if (flags & MessageFlags.Mentions) writeIndexArray(message.mentions!, stream, config.mentionsIdxBits);
    if (flags & MessageFlags.Domains) writeIndexArray(message.domains!, stream, config.domainsIdxBits);
};

export const readMessage = (stream: BitStream, config: MessageBitConfig): Message => {
    const day = stream.getBits(config.dayBits);
    const secondOfDay = stream.getBits(17);
    const authorIndex = stream.getBits(config.authorIdxBits);
    const flags = stream.getBits(9);

    const message: Message = {
        day,
        secondOfDay,
        authorIndex,
    };

    if (flags & MessageFlags.Reply) message.replyOffset = stream.getBits(10);
    if (flags & MessageFlags.Text) {
        message.langIndex = stream.getBits(8);
        message.sentiment = stream.getBits(8) - 128;
    }
    if (flags & MessageFlags.Words) message.words = readIndexArray(stream, config.wordIdxBits);
    if (flags & MessageFlags.Emojis) message.emojis = readIndexArray(stream, config.emojiIdxBits);
    if (flags & MessageFlags.Attachments) message.attachments = readIndexArray(stream, 3);
    if (flags & MessageFlags.Reactions) message.reactions = readIndexArray(stream, config.emojiIdxBits);
    if (flags & MessageFlags.Mentions) message.mentions = readIndexArray(stream, config.mentionsIdxBits);
    if (flags & MessageFlags.Domains) message.domains = readIndexArray(stream, config.domainsIdxBits);

    return message;
};
