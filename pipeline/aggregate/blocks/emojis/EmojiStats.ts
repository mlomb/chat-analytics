import { Index } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

interface EmojiStatsGroup {
    // total = regular + custom
    regular: number;
    custom: number;
    unique: number; // regular & custom
    messagesWithAtLeastOneEmoji: number; // +1 per message that contains at least one emoji (reaction or text)

    counts: {
        /** Number of times each emoji has been sent */
        emojis: number[];
        /** Number of emojis each author has sent */
        authors: number[];
        /** Number of emojis sent in each channel */
        channels: number[];
    };

    // only available during computation
    set?: Set<number>;
}

export interface EmojiStats {
    inText: EmojiStatsGroup;
    inReactions: EmojiStatsGroup;
}

const fn: BlockFn<EmojiStats> = (database, filters, common, args) => {
    const inText: EmojiStatsGroup = {
        regular: 0,
        custom: 0,
        unique: 0,
        messagesWithAtLeastOneEmoji: 0,
        counts: {
            emojis: new Array(database.emojis.length).fill(0),
            authors: new Array(database.authors.length).fill(0),
            channels: new Array(database.channels.length).fill(0),
        },
        set: new Set(),
    };
    const inReactions: EmojiStatsGroup = {
        regular: 0,
        custom: 0,
        unique: 0,
        messagesWithAtLeastOneEmoji: 0,
        counts: {
            emojis: new Array(database.emojis.length).fill(0),
            authors: new Array(database.authors.length).fill(0),
            channels: new Array(database.channels.length).fill(0),
        },
        set: new Set(),
    };

    const processEmojiInGroup = (
        emojiGroup: EmojiStatsGroup,
        index: Index,
        count: number,
        authorIndex: Index,
        channelIndex: Index
    ) => {
        emojiGroup.counts.emojis[index] += count;
        emojiGroup.counts.authors[authorIndex] += count;
        emojiGroup.counts.channels[channelIndex] += count;
        if (database.emojis[index].type === "custom") emojiGroup.custom += count;
        else emojiGroup.regular += count;
        emojiGroup.set!.add(index);
    };

    const processMessage = (msg: MessageView) => {
        const emojis = msg.emojis;
        if (emojis) {
            for (const emoji of emojis) {
                processEmojiInGroup(inText, emoji[0], emoji[1], msg.authorIndex, msg.channelIndex);
                inText.messagesWithAtLeastOneEmoji++;
            }
        }
        const reactions = msg.reactions;
        if (reactions) {
            for (const reaction of reactions) {
                processEmojiInGroup(inReactions, reaction[0], reaction[1], msg.authorIndex, msg.channelIndex);
                inReactions.messagesWithAtLeastOneEmoji++;
            }
        }
    };

    filterMessages(processMessage, database, filters);

    inText.unique = inText.set!.size;
    inText.set = undefined;
    inReactions.unique = inReactions.set!.size;
    inReactions.set = undefined;

    return {
        inText,
        inReactions,
    };
};

export default {
    key: "emoji/stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"emoji/stats", EmojiStats>;
