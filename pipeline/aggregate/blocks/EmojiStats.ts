import { Index } from "@pipeline/Types";
import { BlockDescription, BlockFn, IndexEntry } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface EmojiStats {
    totalEmojis: number;
    totalCustomEmojis: number;
    uniqueEmojis: number;
    messagesWithAtLeastOneEmoji: number;
    emojisCount: number[];
    authorEmojiCount: number[];
    channelEmojiCount: number[];
}

const fn: BlockFn<EmojiStats> = (database, filters, common) => {
    let totalEmojis = 0;
    let totalCustomEmojis = 0;
    let messagesWithAtLeastOneEmoji = 0;
    const emojisCount = new Array(database.emojis.length).fill(0);
    const authorEmojiCount = new Array(database.authors.length).fill(0);
    const channelEmojiCount = new Array(database.channels.length).fill(0);
    const uniqueEmojis = new Set<number>();

    const processMessage = (msg: MessageView, channelIndex: Index) => {
        const emojis = msg.getEmojis();
        if (emojis) {
            for (const emoji of emojis) {
                emojisCount[emoji[0]] += emoji[1];
                authorEmojiCount[msg.authorIndex] += emoji[1];
                channelEmojiCount[channelIndex] += emoji[1];
                totalEmojis += emoji[1];
                if (database.emojis[emoji[0]].c === undefined) {
                    totalCustomEmojis += emoji[1];
                }
                uniqueEmojis.add(emoji[0]);
            }
            messagesWithAtLeastOneEmoji++;
        }
    };

    parseAndFilterMessages(processMessage, database, filters);

    return {
        totalEmojis,
        totalCustomEmojis,
        uniqueEmojis: uniqueEmojis.size,
        messagesWithAtLeastOneEmoji,
        emojisCount,
        authorEmojiCount,
        channelEmojiCount,
    };
};

export default {
    key: "emoji-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"emoji-stats", EmojiStats>;
