import { BitAddress, Index } from "@pipeline/Types";
import { BitStream } from "@pipeline/serialization/BitStream";
import { MessageBitConfig, MessageFlags } from "@pipeline/serialization/MessageSerialization";
import { readIndexArray, skipIndexArray } from "@pipeline/serialization/IndexSerialization";

export class MessageView {
    readonly dayIndex: Index;
    readonly hour: number;
    readonly authorIndex: Index;
    readonly langIndex: Index;
    readonly sentiment: number;

    private wordsOffset: BitAddress = 0;
    private emojisOffset: BitAddress = 0;
    private attachmentsOffset: BitAddress = 0;
    private reactionsOffset: BitAddress = 0;
    private mentionsOffset: BitAddress = 0;
    private domainsOffset: BitAddress = 0;

    constructor(private readonly stream: BitStream, private readonly config: MessageBitConfig) {
        this.dayIndex = stream.getBits(config.dayBits);
        this.hour = stream.getBits(5);
        this.authorIndex = stream.getBits(config.authorIdxBits);
        this.langIndex = stream.getBits(8);
        this.sentiment = stream.getBits(8) - 128;

        const flags = stream.getBits(8);
        if (flags & MessageFlags.Text) {
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

    getWords(): [Index, number][] {
        this.stream.offset = this.wordsOffset;
        return readIndexArray(this.stream, this.config.wordIdxBits);
    }

    getEmojis(): [Index, number][] {
        this.stream.offset = this.emojisOffset;
        return readIndexArray(this.stream, this.config.emojiIdxBits);
    }

    getAttachments(): [Index, number][] {
        this.stream.offset = this.attachmentsOffset;
        return readIndexArray(this.stream, 3);
    }

    getReactions(): [Index, number][] {
        this.stream.offset = this.reactionsOffset;
        return readIndexArray(this.stream, this.config.emojiIdxBits);
    }

    getMentions(): [Index, number][] {
        this.stream.offset = this.mentionsOffset;
        return readIndexArray(this.stream, this.config.mentionsIdxBits);
    }

    getDomains(): [Index, number][] {
        this.stream.offset = this.domainsOffset;
        return readIndexArray(this.stream, this.config.domainsIdxBits);
    }
}
