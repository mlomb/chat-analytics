import { Index } from "@pipeline/Types";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";
import { Day, formatTime } from "@pipeline/Time";

interface MostEntry {
    index: Index;
    value: number;
}

interface TimeWithoutMessages {
    minutes: number;
    start: string;
    end: string;
}

interface AttachmentCount {
    // type is AttachmentType
    [type: string]: number;
}

export interface MessagesStats {
    total: number;
    numActiveDays: number;
    timeWithoutMessages: TimeWithoutMessages;

    attachmentsCount: AttachmentCount;
    withText: number;
    withLinks: number;

    mostAuthors: MostEntry[];
    mostChannels: MostEntry[];
}

const fn: BlockFn<MessagesStats> = (database, filters, common) => {
    const { dateKeys } = common.timeKeys;

    let total = 0,
        withText = 0,
        withLinks = 0;
    const authorsCount = new Array(database.authors.length).fill(0);
    const channelsCount = new Array(database.channels.length).fill(0);
    const attachmentsCount: AttachmentCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const numFiveMinBlocks = 24 * 12 * database.time.numDays;
    const fiveMinMessagesCount = new Array(numFiveMinBlocks).fill(0);

    const processMessage = (msg: MessageView, channelIndex: Index) => {
        total++;
        authorsCount[msg.authorIndex]++;
        channelsCount[channelIndex]++;
        fiveMinMessagesCount[msg.dayIndex * 288 + Math.floor(msg.secondOfDay / 300)]++;

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

    const timeWithoutMessages: TimeWithoutMessages = {
        minutes: -1,
        start: "A",
        end: "B",
    };
    // NOTE: doing it this way, we are not counting the periods in the sides (which is what we want)
    // if the first message ever is in the last 5m block of the day, it should not count 0-23.55 as "no messages"
    let prevMessage = -1;
    for (let i = 0; i < numFiveMinBlocks; i++) {
        // found a 5 minute block with messages
        if (fiveMinMessagesCount[i] > 0) {
            // did we find one before?
            if (prevMessage !== -1) {
                // check the difference
                const diff = (i - prevMessage) * 5;
                if (diff > timeWithoutMessages.minutes) {
                    timeWithoutMessages.minutes = diff;
                    timeWithoutMessages.start = formatTime(Day.fromKey(dateKeys[Math.floor(prevMessage / 288)]), (prevMessage % 288) * 5 * 60); // prettier-ignore
                    timeWithoutMessages.end = formatTime(Day.fromKey(dateKeys[Math.floor(i / 288)]), (i % 288) * 5 * 60); // prettier-ignore
                }
            }

            // set the last message as i
            prevMessage = i;
        }
    }

    return {
        total,
        numActiveDays: filters.numActiveDays,
        timeWithoutMessages,

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
