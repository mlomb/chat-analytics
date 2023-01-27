import { BitAddress, Index } from "@pipeline/Types";
import { FullMessage } from "@pipeline/process/Types";
import { BitStream } from "@pipeline/serialization/BitStream";
import { readIndexArray, skipIndexArray } from "@pipeline/serialization/IndexSerialization";
import { MessageBitConfig, MessageFlags } from "@pipeline/serialization/MessageSerialization";

export class MessageView {
    readonly channelIndex: Index;
    readonly dayIndex: Index;
    readonly secondOfDay: number;
    readonly authorIndex: Index;
    readonly replyOffset?: number;
    readonly langIndex?: Index;
    readonly sentiment?: number;

    private wordsOffset: BitAddress = 0;
    private emojisOffset: BitAddress = 0;
    private attachmentsOffset: BitAddress = 0;
    private reactionsOffset: BitAddress = 0;
    private mentionsOffset: BitAddress = 0;
    private domainsOffset: BitAddress = 0;

    get hasText(): boolean { return this.langIndex !== undefined; } // prettier-ignore
    get hasWords(): boolean { return this.wordsOffset > 0; } // prettier-ignore
    get hasEmojis(): boolean { return this.emojisOffset > 0; } // prettier-ignore
    get hasAttachments(): boolean { return this.attachmentsOffset > 0; } // prettier-ignore
    get hasReactions(): boolean { return this.reactionsOffset > 0; } // prettier-ignore
    get hasMentions(): boolean { return this.mentionsOffset > 0; } // prettier-ignore
    get hasDomains(): boolean { return this.domainsOffset > 0; } // prettier-ignore

    constructor(private readonly stream: BitStream, private readonly config: MessageBitConfig, channelIndex: Index) {
        this.channelIndex = channelIndex;
        this.dayIndex = stream.getBits(config.dayBits);
        this.secondOfDay = stream.getBits(17);
        this.authorIndex = stream.getBits(config.authorIdxBits);

        const flags = stream.getBits(9);
        if (flags & MessageFlags.Reply) {
            this.replyOffset = stream.getBits(10);
        }
        if (flags & MessageFlags.Text) {
            this.langIndex = stream.getBits(8);
            this.sentiment = stream.getBits(8) - 128;
        }
        if (flags & MessageFlags.Words) {
            this.wordsOffset = stream.offset;
            skipIndexArray(stream, config.wordIdxBits);
        }
        if (flags & MessageFlags.Emojis) {
            this.emojisOffset = stream.offset;
            skipIndexArray(stream, config.emojiIdxBits);
        }
        if (flags & MessageFlags.Attachments) {
            this.attachmentsOffset = stream.offset;
            skipIndexArray(stream, 3);
        }
        if (flags & MessageFlags.Reactions) {
            this.reactionsOffset = stream.offset;
            skipIndexArray(stream, config.emojiIdxBits);
        }
        if (flags & MessageFlags.Mentions) {
            this.mentionsOffset = stream.offset;
            skipIndexArray(stream, config.mentionsIdxBits);
        }
        if (flags & MessageFlags.Domains) {
            this.domainsOffset = stream.offset;
            skipIndexArray(stream, config.domainsIdxBits);
        }
    }

    getWords(): [Index, number][] | undefined {
        if (this.wordsOffset === 0) return undefined;
        this.stream.offset = this.wordsOffset;
        return readIndexArray(this.stream, this.config.wordIdxBits);
    }

    getEmojis(): [Index, number][] | undefined {
        if (this.emojisOffset === 0) return undefined;
        this.stream.offset = this.emojisOffset;
        return readIndexArray(this.stream, this.config.emojiIdxBits);
    }

    getAttachments(): [Index, number][] | undefined {
        if (this.attachmentsOffset === 0) return undefined;
        this.stream.offset = this.attachmentsOffset;
        return readIndexArray(this.stream, 3);
    }

    getReactions(): [Index, number][] | undefined {
        if (this.reactionsOffset === 0) return undefined;
        this.stream.offset = this.reactionsOffset;
        return readIndexArray(this.stream, this.config.emojiIdxBits);
    }

    getMentions(): [Index, number][] | undefined {
        if (this.mentionsOffset === 0) return undefined;
        this.stream.offset = this.mentionsOffset;
        return readIndexArray(this.stream, this.config.mentionsIdxBits);
    }

    getDomains(): [Index, number][] | undefined {
        if (this.domainsOffset === 0) return undefined;
        this.stream.offset = this.domainsOffset;
        return readIndexArray(this.stream, this.config.domainsIdxBits);
    }

    getFullMessage(): FullMessage {
        return {
            day: this.dayIndex,
            secondOfDay: this.secondOfDay,
            authorIndex: this.authorIndex,
            replyOffset: this.replyOffset,
            langIndex: this.langIndex,
            sentiment: this.sentiment,
            words: this.getWords(),
            emojis: this.getEmojis(),
            attachments: this.getAttachments(),
            reactions: this.getReactions(),
            mentions: this.getMentions(),
            domains: this.getDomains(),
            channelIndex: this.channelIndex,
        };
    }
}
