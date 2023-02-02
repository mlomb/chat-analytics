import { Index } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

interface EmojiStatsGroup {
    // total = regular + custom
    regular: number;
    custom: number;
    unique: number; // regular & custom
    oncePerMessage: number; // +1 per message that contains at least one emoji
    count: number[];
    authorCount: number[];
    channelCount: number[];

    // only available during computation
    set?: Set<number>;
}

export interface EmojiStats {
    inText: EmojiStatsGroup;
    inReactions: EmojiStatsGroup;
}

const fn: BlockFn<EmojiStats> = (database, filters, common) => {
    const inText: EmojiStatsGroup = {
        regular: 0,
        custom: 0,
        unique: 0,
        oncePerMessage: 0,
        count: new Array(database.emojis.length).fill(0),
        authorCount: new Array(database.authors.length).fill(0),
        channelCount: new Array(database.channels.length).fill(0),
        set: new Set(),
    };
    const inReactions: EmojiStatsGroup = {
        regular: 0,
        custom: 0,
        unique: 0,
        oncePerMessage: 0,
        count: new Array(database.emojis.length).fill(0),
        authorCount: new Array(database.authors.length).fill(0),
        channelCount: new Array(database.channels.length).fill(0),
        set: new Set(),
    };
    const authorEmojiCount = new Array(database.authors.length).fill(0);
    const channelEmojiCount = new Array(database.channels.length).fill(0);

    const processEmojiInGroup = (
        emojiGroup: EmojiStatsGroup,
        index: Index,
        count: number,
        authorIndex: Index,
        channelIndex: Index
    ) => {
        emojiGroup.count[index] += count;
        emojiGroup.authorCount[authorIndex] += count;
        emojiGroup.channelCount[channelIndex] += count;
        if (database.emojis[index].symbol === undefined) emojiGroup.custom += count;
        else emojiGroup.regular += count;
        emojiGroup.set!.add(index);
    };

    const processMessage = (msg: MessageView) => {
        const emojis = msg.emojis;
        if (emojis) {
            for (const emoji of emojis) {
                processEmojiInGroup(inText, emoji[0], emoji[1], msg.authorIndex, msg.channelIndex);
                inText.oncePerMessage++;
            }
        }
        const reactions = msg.reactions;
        if (reactions) {
            for (const reaction of reactions) {
                processEmojiInGroup(inReactions, reaction[0], reaction[1], msg.authorIndex, msg.channelIndex);
                inReactions.oncePerMessage++;
            }
        }
    };

    parseAndFilterMessages(processMessage, database, filters);

    inText.unique = inText.set!.size;
    inText.set = undefined;
    inReactions.unique = inReactions.set!.size;
    inReactions.set = undefined;

    return {
        inText,
        inReactions,
        authorEmojiCount,
        channelEmojiCount,
    };
};

export default {
    key: "emoji-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"emoji-stats", EmojiStats>;
