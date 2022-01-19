import { Index } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface InteractionStats {
    mentionsCount: number[];
}

const fn: BlockFn<InteractionStats> = (database, filters, common) => {
    const mentionsCount = new Array(database.mentions.length).fill(0);

    const processMessage = (msg: MessageView, channelIndex: Index) => {
        const mentions = msg.getMentions();
        if (mentions) {
            for (const mention of mentions) {
                mentionsCount[mention[0]] += mention[1];
            }
        }
    };

    parseAndFilterMessages(processMessage, database, filters);

    return {
        mentionsCount,
    };
};

export default {
    key: "interaction-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"interaction-stats", InteractionStats>;
