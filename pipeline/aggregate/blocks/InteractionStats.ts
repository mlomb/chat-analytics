import { Index, Message } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface InteractionStats {
    mentionsCount: number[];
    topReactions: [Message, number][];
}

const fn: BlockFn<InteractionStats> = (database, filters, common) => {
    const mentionsCount = new Array(database.mentions.length).fill(0);
    let topReactions: [Message, number][] = [];

    const processMessage = (msg: MessageView, channelIndex: Index) => {
        const mentions = msg.getMentions();
        if (mentions) {
            for (const mention of mentions) {
                mentionsCount[mention[0]] += mention[1];
            }
        }
        const reactions = msg.getReactions();
        if (reactions) {
            let reactionCount = 0;
            for (const reaction of reactions) {
                reactionCount += reaction[1];
            }
            if (reactionCount > 0) {
                if (topReactions.length === 0 || reactionCount > topReactions[topReactions.length - 1][1]) {
                    topReactions.push([msg.getFullMessage(), reactionCount]);
                    topReactions = topReactions.sort((a, b) => b[1] - a[1]).slice(0, 3);
                }
            }
        }
    };

    parseAndFilterMessages(processMessage, database, filters);

    return {
        mentionsCount,
        topReactions,
    };
};

export default {
    key: "interaction-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"interaction-stats", InteractionStats>;
