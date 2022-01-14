import { Index } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

interface MostEntry {
    index: Index;
    value: number;
}

export interface MessagesStats {
    total: number;
    avgDay: number;
    mostAuthors: MostEntry[];
    mostChannels: MostEntry[];
}

const fn: BlockFn<MessagesStats> = (database, filters) => {
    let total = 0;
    const authorsCount = new Array(database.authors.length).fill(0);
    const channelsCount = new Array(database.channels.length).fill(0);

    const processMessage = (msg: MessageView, channelIndex: Index) => {
        total++;
        authorsCount[msg.authorIndex]++;
        channelsCount[channelIndex]++;
    };

    parseAndFilterMessages(processMessage, database, filters);

    return {
        total,
        avgDay: total / filters.numActiveDays,
        mostAuthors: authorsCount
            .map((v, i) => ({ index: i, value: v }))
            .filter((v) => v.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 20),
        mostChannels: channelsCount
            .map((v, i) => ({ index: i, value: v }))
            .filter((v) => v.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 20),
    };
};

export default {
    key: "messages-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"messages-stats", MessagesStats>;
