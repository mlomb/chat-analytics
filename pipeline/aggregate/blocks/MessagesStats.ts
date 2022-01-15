import { AttachmentType, Index } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

interface MostEntry {
    index: Index;
    value: number;
}

interface AttachmentCount {
    // type is AttachmentType
    [type: string]: number;
}

export interface MessagesStats {
    total: number;
    numActiveDays: number;

    attachmentsCount: AttachmentCount;
    withText: number;
    withLinks: number;

    mostAuthors: MostEntry[];
    mostChannels: MostEntry[];
}

const fn: BlockFn<MessagesStats> = (database, filters) => {
    let total = 0,
        withText = 0,
        withLinks = 0;
    const authorsCount = new Array(database.authors.length).fill(0);
    const channelsCount = new Array(database.channels.length).fill(0);
    const attachmentsCount: AttachmentCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    const processMessage = (msg: MessageView, channelIndex: Index) => {
        total++;
        authorsCount[msg.authorIndex]++;
        channelsCount[channelIndex]++;

        const attachments = msg.getAttachments();
        if (attachments) {
            for (const attachment of attachments) {
                attachmentsCount[attachment[0]] += attachment[1];
            }
        }

        if (msg.langIndex !== undefined) withText++;
        if (msg.hasDomains) withLinks++;
    };

    parseAndFilterMessages(processMessage, database, filters);

    return {
        total,
        numActiveDays: filters.numActiveDays,

        attachmentsCount,
        withText,
        withLinks,

        mostAuthors: authorsCount
            .map((v, i) => ({ index: i, value: v }))
            .filter((v) => v.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 15),
        mostChannels: channelsCount
            .map((v, i) => ({ index: i, value: v }))
            .filter((v) => v.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 15),
    };
};

export default {
    key: "messages-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"messages-stats", MessagesStats>;
