import { IntermediateMessage } from "@pipeline/Types";
import { BitStream } from "@pipeline/serialization/BitStream";
import { readIndexArray, writeIndexArray } from "@pipeline/serialization/IndexSerialization";

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
    dayBits: number;
    authorIdxBits: number;
    wordIdxBits: number;
    emojiIdxBits: number;
    mentionsIdxBits: number;
    domainsIdxBits: number;
}

export const writeIntermediateMessage = (message: IntermediateMessage, stream: BitStream, config: MessageBitConfig) => {
    stream.setBits(config.dayBits, message.day);
    stream.setBits(5, message.hour); // 0-23
    stream.setBits(config.authorIdxBits, message.authorIndex);
    stream.setBits(8, message.langIndex); // 0-255
    stream.setBits(8, message.sentiment); // 0-255

    let flags = MessageFlags.None;
    if (message.words?.length) flags |= MessageFlags.Text;
    if (message.emojis?.length) flags |= MessageFlags.Emojis;
    if (message.attachments?.length) flags |= MessageFlags.Attachments;
    if (message.reactions?.length) flags |= MessageFlags.Reactions;
    if (message.mentions?.length) flags |= MessageFlags.Mentions;
    if (message.domains?.length) flags |= MessageFlags.Domains;
    stream.setBits(8, flags);

    if (flags & MessageFlags.Text) writeIndexArray(message.words!, stream, config.wordIdxBits);
    if (flags & MessageFlags.Emojis) writeIndexArray(message.emojis!, stream, config.emojiIdxBits);
    if (flags & MessageFlags.Attachments) writeIndexArray(message.attachments!, stream, 3);
    if (flags & MessageFlags.Reactions) writeIndexArray(message.reactions!, stream, config.emojiIdxBits);
    if (flags & MessageFlags.Mentions) writeIndexArray(message.mentions!, stream, config.mentionsIdxBits);
    if (flags & MessageFlags.Domains) writeIndexArray(message.domains!, stream, config.domainsIdxBits);
};

export const readIntermediateMessage = (stream: BitStream, config: MessageBitConfig): IntermediateMessage => {
    const day = stream.getBits(config.dayBits);
    const hour = stream.getBits(5);
    const authorIndex = stream.getBits(config.authorIdxBits);
    const langIndex = stream.getBits(8);
    const sentiment = stream.getBits(8);
    const flags = stream.getBits(8);

    const message: IntermediateMessage = {
        day,
        hour,
        authorIndex,
        langIndex,
        sentiment,
    };

    if (flags & MessageFlags.Text) message.words = readIndexArray(stream, config.wordIdxBits);
    if (flags & MessageFlags.Emojis) message.emojis = readIndexArray(stream, config.emojiIdxBits);
    if (flags & MessageFlags.Attachments) message.attachments = readIndexArray(stream, 3);
    if (flags & MessageFlags.Reactions) message.reactions = readIndexArray(stream, config.emojiIdxBits);
    if (flags & MessageFlags.Mentions) message.mentions = readIndexArray(stream, config.mentionsIdxBits);
    if (flags & MessageFlags.Domains) message.domains = readIndexArray(stream, config.domainsIdxBits);

    return message;
};
