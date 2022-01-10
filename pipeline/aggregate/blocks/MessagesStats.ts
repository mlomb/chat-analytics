import { ID, Message } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";

interface MostEntry {
    id: ID;
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

    const processMessage = (msg: Message, channelId: ID) => {
        total++;
        authorsCount[msg.authorId]++;
        channelsCount[channelId]++;
    };

    parseAndFilterMessages(processMessage, database, filters);

    return {
        total,
        avgDay: total / filters.numActiveDays,
        mostAuthors: authorsCount
            .map((v, i) => ({ id: i, value: v }))
            .filter((v) => v.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 20),
        mostChannels: channelsCount
            .map((v, i) => ({ id: i, value: v }))
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
