import { Message } from "@pipeline/process/Types";
import { BitStream } from "@pipeline/serialization/BitStream";
import { readIndexCounts, writeIndexCounts } from "@pipeline/serialization/IndexCountsSerialization";

/** These flags are used to encode the presence of optional fields in a Message */
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

/** Defines how many bits are used for various fields in a Message */
export interface MessageBitConfig {
    dayBits: number;
    authorIdxBits: number;
    wordIdxBits: number;
    emojiIdxBits: number;
    mentionsIdxBits: number;
    domainsIdxBits: number;
}

/**
 * Default bit configuration for messages.
 * At the start we don't know how many authors, words, emojis, etc. we have, so we have to use a conservative
 * configuration that works for all possible values.
 *
 * These values are hand-picked.
 */
export const DefaultMessageBitConfig: MessageBitConfig = {
    dayBits: 21, // 12 + 4 + 5
    authorIdxBits: 21,
    wordIdxBits: 21,
    emojiIdxBits: 18,
    mentionsIdxBits: 20,
    domainsIdxBits: 16,
};

/** Writes the message into the stream using the provided bit configuration */
export const writeMessage = (message: Message, stream: BitStream, bitConfig: MessageBitConfig) => {
    stream.setBits(bitConfig.dayBits, message.day);
    stream.setBits(17, message.secondOfDay); // 0-2^17 (needed 86400)
    stream.setBits(bitConfig.authorIdxBits, message.authorIndex);

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
    if (flags & MessageFlags.Words) writeIndexCounts(message.words!, stream, bitConfig.wordIdxBits);
    if (flags & MessageFlags.Emojis) writeIndexCounts(message.emojis!, stream, bitConfig.emojiIdxBits);
    if (flags & MessageFlags.Attachments) writeIndexCounts(message.attachments!, stream, 3);
    if (flags & MessageFlags.Reactions) writeIndexCounts(message.reactions!, stream, bitConfig.emojiIdxBits);
    if (flags & MessageFlags.Mentions) writeIndexCounts(message.mentions!, stream, bitConfig.mentionsIdxBits);
    if (flags & MessageFlags.Domains) writeIndexCounts(message.domains!, stream, bitConfig.domainsIdxBits);
};

/**
 * Reads a whole message from the stream using the provided bit configuration.
 * If you don't need all the fields, you may want to use the `MessageView` class instead.
 */
export const readMessage = (stream: BitStream, bitConfig: MessageBitConfig): Message => {
    const day = stream.getBits(bitConfig.dayBits);
    const secondOfDay = stream.getBits(17);
    const authorIndex = stream.getBits(bitConfig.authorIdxBits);
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
    if (flags & MessageFlags.Words) message.words = readIndexCounts(stream, bitConfig.wordIdxBits);
    if (flags & MessageFlags.Emojis) message.emojis = readIndexCounts(stream, bitConfig.emojiIdxBits);
    if (flags & MessageFlags.Attachments) message.attachments = readIndexCounts(stream, 3);
    if (flags & MessageFlags.Reactions) message.reactions = readIndexCounts(stream, bitConfig.emojiIdxBits);
    if (flags & MessageFlags.Mentions) message.mentions = readIndexCounts(stream, bitConfig.mentionsIdxBits);
    if (flags & MessageFlags.Domains) message.domains = readIndexCounts(stream, bitConfig.domainsIdxBits);

    return message;
};
