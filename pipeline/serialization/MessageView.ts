import { Index } from "@pipeline/Types";
import { IndexCounts } from "@pipeline/process/IndexCounts";
import { FullMessage, Message } from "@pipeline/process/Types";
import { BitAddress, BitStream } from "@pipeline/serialization/BitStream";
import { readIndexCounts, skipIndexCounts } from "@pipeline/serialization/IndexCountsSerialization";
import { MessageBitConfig, MessageFlags } from "@pipeline/serialization/MessageSerialization";

/**
 * This is an alternative to the `readMessage` function. It deserializes parts of a Message on demand,
 * being faster when only a few fields are needed. Perfect for computing aggregate blocks, where
 * each block may need only a few and different fields.
 */
export class MessageView implements Message {
    // provided for convenience
    channelIndex: Index = -1;

    readonly dayIndex: Index;
    readonly secondOfDay: number;
    readonly authorIndex: Index;
    readonly replyOffset?: number;
    readonly langIndex?: Index;
    readonly sentiment?: number;

    private readonly flags: MessageFlags;
    private readonly wordsOffset: BitAddress = 0;
    private readonly emojisOffset: BitAddress = 0;
    private readonly attachmentsOffset: BitAddress = 0;
    private readonly reactionsOffset: BitAddress = 0;
    private readonly mentionsOffset: BitAddress = 0;
    private readonly domainsOffset: BitAddress = 0;

    get hasText(): boolean { return (this.flags & MessageFlags.Text) > 0; } // prettier-ignore
    get hasReply(): boolean { return (this.flags & MessageFlags.Reply) > 0; } // prettier-ignore
    get hasWords(): boolean { return (this.flags & MessageFlags.Words) > 0; } // prettier-ignore
    get hasEmojis(): boolean { return (this.flags & MessageFlags.Emojis) > 0; } // prettier-ignore
    get hasAttachments(): boolean { return (this.flags & MessageFlags.Attachments) > 0; } // prettier-ignore
    get hasReactions(): boolean { return (this.flags & MessageFlags.Reactions) > 0; } // prettier-ignore
    get hasMentions(): boolean { return (this.flags & MessageFlags.Mentions) > 0; } // prettier-ignore
    get hasDomains(): boolean { return (this.flags & MessageFlags.Domains) > 0; } // prettier-ignore

    constructor(private readonly stream: BitStream, private readonly config: MessageBitConfig) {
        this.dayIndex = stream.getBits(config.dayBits);
        this.secondOfDay = stream.getBits(17);
        this.authorIndex = stream.getBits(config.authorIdxBits);
        this.flags = stream.getBits(9);

        if (this.hasReply) this.replyOffset = stream.getBits(10);
        if (this.hasText) {
            this.langIndex = stream.getBits(8);
            this.sentiment = stream.getBits(8) - 128;
        }
        if (this.hasWords) {
            this.wordsOffset = stream.offset;
            skipIndexCounts(stream, config.wordIdxBits);
        }
        if (this.hasEmojis) {
            this.emojisOffset = stream.offset;
            skipIndexCounts(stream, config.emojiIdxBits);
        }
        if (this.hasAttachments) {
            this.attachmentsOffset = stream.offset;
            skipIndexCounts(stream, 3);
        }
        if (this.hasReactions) {
            this.reactionsOffset = stream.offset;
            skipIndexCounts(stream, config.emojiIdxBits);
        }
        if (this.hasMentions) {
            this.mentionsOffset = stream.offset;
            skipIndexCounts(stream, config.mentionsIdxBits);
        }
        if (this.hasDomains) {
            this.domainsOffset = stream.offset;
            skipIndexCounts(stream, config.domainsIdxBits);
        }
    }

    get words(): IndexCounts | undefined {
        if (this.wordsOffset === 0) return undefined;
        this.stream.offset = this.wordsOffset;
        return readIndexCounts(this.stream, this.config.wordIdxBits);
    }

    get emojis(): IndexCounts | undefined {
        if (this.emojisOffset === 0) return undefined;
        this.stream.offset = this.emojisOffset;
        return readIndexCounts(this.stream, this.config.emojiIdxBits);
    }

    get attachments(): IndexCounts | undefined {
        if (this.attachmentsOffset === 0) return undefined;
        this.stream.offset = this.attachmentsOffset;
        return readIndexCounts(this.stream, 3);
    }

    get reactions(): IndexCounts | undefined {
        if (this.reactionsOffset === 0) return undefined;
        this.stream.offset = this.reactionsOffset;
        return readIndexCounts(this.stream, this.config.emojiIdxBits);
    }

    get mentions(): IndexCounts | undefined {
        if (this.mentionsOffset === 0) return undefined;
        this.stream.offset = this.mentionsOffset;
        return readIndexCounts(this.stream, this.config.mentionsIdxBits);
    }

    get domains(): IndexCounts | undefined {
        if (this.domainsOffset === 0) return undefined;
        this.stream.offset = this.domainsOffset;
        return readIndexCounts(this.stream, this.config.domainsIdxBits);
    }

    getFullMessage(): FullMessage {
        return {
            dayIndex: this.dayIndex,
            secondOfDay: this.secondOfDay,
            authorIndex: this.authorIndex,
            replyOffset: this.replyOffset,
            langIndex: this.langIndex,
            sentiment: this.sentiment,
            words: this.words,
            emojis: this.emojis,
            attachments: this.attachments,
            reactions: this.reactions,
            mentions: this.mentions,
            domains: this.domains,
            channelIndex: this.channelIndex,
        };
    }
}
