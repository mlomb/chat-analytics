import { AttachmentType } from "@pipeline/Attachments";
import { Index } from "@pipeline/Types";
import { IndexCounts } from "@pipeline/process/IndexCounts";
import { Message, MessageComplete } from "@pipeline/process/Types";
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
    guildIndex: Index = -1;
    channelIndex: Index = -1;

    readonly dayIndex: Index;
    readonly secondOfDay: number;
    readonly editedAfter?: number;
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
    get hasEdits(): boolean { return (this.flags & MessageFlags.Edited) > 0; } // prettier-ignore
    get hasWords(): boolean { return (this.flags & MessageFlags.Words) > 0; } // prettier-ignore
    get hasEmojis(): boolean { return (this.flags & MessageFlags.Emojis) > 0; } // prettier-ignore
    get hasAttachments(): boolean { return (this.flags & MessageFlags.Attachments) > 0; } // prettier-ignore
    get hasReactions(): boolean { return (this.flags & MessageFlags.Reactions) > 0; } // prettier-ignore
    get hasMentions(): boolean { return (this.flags & MessageFlags.Mentions) > 0; } // prettier-ignore
    get hasDomains(): boolean { return (this.flags & MessageFlags.Domains) > 0; } // prettier-ignore

    constructor(private readonly stream: BitStream, private readonly bitConfig: MessageBitConfig) {
        // PERFORMANCE NOTE: this is probably the most performance-critical part of report aggregation
        // Instead of using `.hasXXX` we inline the checks to avoid the function call overhead, which REALLY adds up here

        this.dayIndex = stream.getBits(bitConfig.dayBits);
        this.secondOfDay = stream.getBits(17);
        this.authorIndex = stream.getBits(bitConfig.authorIdxBits);
        this.flags = stream.getBits(9);

        if ((this.flags & MessageFlags.Edited) > 0) this.editedAfter = stream.readVarInt();
        if ((this.flags & MessageFlags.Reply) > 0) this.replyOffset = stream.readVarInt();
        if ((this.flags & MessageFlags.Text) > 0) {
            this.langIndex = stream.getBits(8);
            this.sentiment = stream.getBits(8) - 128;
        }
        if ((this.flags & MessageFlags.Words) > 0) {
            this.wordsOffset = stream.offset;
            skipIndexCounts(stream, bitConfig.wordIdxBits);
        }
        if ((this.flags & MessageFlags.Emojis) > 0) {
            this.emojisOffset = stream.offset;
            skipIndexCounts(stream, bitConfig.emojiIdxBits);
        }
        if ((this.flags & MessageFlags.Attachments) > 0) {
            this.attachmentsOffset = stream.offset;
            skipIndexCounts(stream, 3);
        }
        if ((this.flags & MessageFlags.Reactions) > 0) {
            this.reactionsOffset = stream.offset;
            skipIndexCounts(stream, bitConfig.emojiIdxBits);
        }
        if ((this.flags & MessageFlags.Mentions) > 0) {
            this.mentionsOffset = stream.offset;
            skipIndexCounts(stream, bitConfig.mentionsIdxBits);
        }
        if ((this.flags & MessageFlags.Domains) > 0) {
            this.domainsOffset = stream.offset;
            skipIndexCounts(stream, bitConfig.domainsIdxBits);
        }
    }

    get words(): IndexCounts | undefined {
        if (this.wordsOffset === 0) return undefined;
        this.stream.offset = this.wordsOffset;
        return readIndexCounts(this.stream, this.bitConfig.wordIdxBits);
    }

    get emojis(): IndexCounts | undefined {
        if (this.emojisOffset === 0) return undefined;
        this.stream.offset = this.emojisOffset;
        return readIndexCounts(this.stream, this.bitConfig.emojiIdxBits);
    }

    get attachments(): IndexCounts<AttachmentType> | undefined {
        if (this.attachmentsOffset === 0) return undefined;
        this.stream.offset = this.attachmentsOffset;
        return readIndexCounts(this.stream, 3);
    }

    get reactions(): IndexCounts | undefined {
        if (this.reactionsOffset === 0) return undefined;
        this.stream.offset = this.reactionsOffset;
        return readIndexCounts(this.stream, this.bitConfig.emojiIdxBits);
    }

    get mentions(): IndexCounts | undefined {
        if (this.mentionsOffset === 0) return undefined;
        this.stream.offset = this.mentionsOffset;
        return readIndexCounts(this.stream, this.bitConfig.mentionsIdxBits);
    }

    get domains(): IndexCounts | undefined {
        if (this.domainsOffset === 0) return undefined;
        this.stream.offset = this.domainsOffset;
        return readIndexCounts(this.stream, this.bitConfig.domainsIdxBits);
    }

    get reply(): MessageView | undefined {
        if (this.hasReply) {
            this.stream.offset = this.replyOffset!;
            return new MessageView(this.stream, this.bitConfig);
        }
        return undefined;
    }

    getFullMessage(): MessageComplete {
        return {
            dayIndex: this.dayIndex,
            secondOfDay: this.secondOfDay,
            editedAfter: this.editedAfter,
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

            guildIndex: this.guildIndex,
            channelIndex: this.channelIndex,
        };
    }
}
