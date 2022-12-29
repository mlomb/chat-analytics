import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface SentimentStats {
    positiveMessages: number;
    negativeMessages: number;
    neutralMessages: number;
}

const fn: BlockFn<SentimentStats> = (database, filters, common) => {
    const res: SentimentStats = {
        positiveMessages: 0,
        negativeMessages: 0,
        neutralMessages: 0,
    };

    const processMessage = (msg: MessageView) => {
        const sentiment = msg.sentiment;
        if (sentiment !== undefined) {
            if (sentiment === 0) res.neutralMessages++;
            else if (sentiment > 0) res.positiveMessages++;
            else res.negativeMessages++;
        }
    };

    parseAndFilterMessages(processMessage, database, filters);

    return res;
};

export default {
    key: "sentiment-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"sentiment-stats", SentimentStats>;
