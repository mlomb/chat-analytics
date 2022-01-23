import { FullMessage } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface InteractionStats {
    mentionsCount: number[];
    authorsReplyCount: number[];

    topTotalReactions: FullMessage[];
    topSingleReactions: FullMessage[];
}

const fn: BlockFn<InteractionStats> = (database, filters, common) => {
    const mentionsCount = new Array(database.mentions.length).fill(0);
    const authorsReplyCount: number[] = new Array(database.authors.length).fill(0);

    let topTotalReactions: [MessageView, number][] = [];
    let topSingleReactions: [MessageView, number][] = [];

    const processMessage = (msg: MessageView) => {
        const mentions = msg.getMentions();
        if (mentions) {
            for (const mention of mentions) {
                mentionsCount[mention[0]] += mention[1];
            }
        }
        const reactions = msg.getReactions();
        if (reactions) {
            let reactionCount = 0,
                maxReactionCount = 0;
            for (const reaction of reactions) {
                reactionCount += reaction[1];
                maxReactionCount = Math.max(maxReactionCount, reaction[1]);
            }
            if (reactionCount > 0) {
                if (
                    topTotalReactions.length === 0 ||
                    reactionCount > topTotalReactions[topTotalReactions.length - 1][1]
                ) {
                    topTotalReactions.push([msg, reactionCount]);
                    topTotalReactions = topTotalReactions.sort((a, b) => b[1] - a[1]).slice(0, 3);
                }
            }
            if (maxReactionCount > 0) {
                if (
                    topSingleReactions.length === 0 ||
                    maxReactionCount > topSingleReactions[topSingleReactions.length - 1][1]
                ) {
                    topSingleReactions.push([msg, maxReactionCount]);
                    topSingleReactions = topSingleReactions.sort((a, b) => b[1] - a[1]).slice(0, 3);
                }
            }
        }

        if (msg.replyOffset !== undefined) {
            authorsReplyCount[msg.authorIndex] += 1;
        }
    };

    parseAndFilterMessages(processMessage, database, filters);

    return {
        mentionsCount,
        authorsReplyCount,

        topTotalReactions: topTotalReactions.map(([msg, _]) => msg.getFullMessage()),
        topSingleReactions: topSingleReactions.map(([msg, _]) => msg.getFullMessage()),
    };
};

export default {
    key: "interaction-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"interaction-stats", InteractionStats>;
