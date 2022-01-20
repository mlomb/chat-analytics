import { Index, Message } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface InteractionStats {
    mentionsCount: number[];
    topReaction: Message | null;
}

const fn: BlockFn<InteractionStats> = (database, filters, common) => {
    const mentionsCount = new Array(database.mentions.length).fill(0);
    let topReaction: Message | null = null;
    let topReactionCount = 0;

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
            if (reactionCount > topReactionCount) {
                topReactionCount = reactionCount;
                topReaction = msg.getFullMessage();
            }
        }
    };

    parseAndFilterMessages(processMessage, database, filters);

    return {
        mentionsCount,
        topReaction,
    };
};

export default {
    key: "interaction-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"interaction-stats", InteractionStats>;
