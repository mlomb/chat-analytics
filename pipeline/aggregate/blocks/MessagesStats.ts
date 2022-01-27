import { Index } from "@pipeline/Types";
import { BlockDescription, BlockFn, IndexEntry } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";
import { Day, formatTime } from "@pipeline/Time";

interface PeriodStat {
    minutes: number;
    start: string;
    end: string;
}

interface AttachmentCount {
    // type is AttachmentType
    [type: string]: number;
}

interface ActivityEntry {
    value: number;
    hour: `${number}hs`;
    weekday: "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
}

interface MostActiveEntry {
    messages: number;
    text: string;
}

export interface MessagesStats {
    total: number;
    numActiveDays: number;

    longestTimeWithoutMessages: PeriodStat;
    longestActiveConversation: PeriodStat;

    attachmentsCount: AttachmentCount;
    withText: number;
    withLinks: number;

    authorsCount: number[];
    channelsCount: number[];

    activity: ActivityEntry[];
    mostActive: {
        hour: MostActiveEntry;
        day: MostActiveEntry;
        month: MostActiveEntry;
        year: MostActiveEntry;
    };
}

const fn: BlockFn<MessagesStats> = (database, filters, common) => {
    const { dateKeys, weekKeys, monthKeys, yearKeys, dateToWeekIndex, dateToMonthIndex, dateToYearIndex } =
        common.timeKeys;

    let total = 0,
        withText = 0,
        withLinks = 0;
    const authorsCount = new Array(database.authors.length).fill(0);
    const channelsCount = new Array(database.channels.length).fill(0);
    const attachmentsCount: AttachmentCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const numFiveMinBlocks = 24 * 12 * database.time.numDays;

    const fiveMinMessagesCount = new Array(numFiveMinBlocks).fill(0);
    const hourlyCounts: number[] = new Array(24 * database.time.numDays).fill(0);
    const dailyCounts: number[] = new Array(database.time.numDays).fill(0);
    const monthlyCounts: number[] = new Array(database.time.numMonths).fill(0);
    const yearlyCounts: number[] = new Array(database.time.numYears).fill(0);

    const activityCounts: number[] = new Array(7 * 24).fill(0);

    const processMessage = (msg: MessageView) => {
        total++;
        authorsCount[msg.authorIndex]++;
        channelsCount[msg.channelIndex]++;
        fiveMinMessagesCount[msg.dayIndex * 288 + Math.floor(msg.secondOfDay / 300)]++;
        hourlyCounts[msg.dayIndex * 24 + Math.floor(msg.secondOfDay / 3600)]++;
        dailyCounts[msg.dayIndex]++;
        monthlyCounts[dateToMonthIndex[msg.dayIndex]]++;
        yearlyCounts[dateToYearIndex[msg.dayIndex]]++;

        const dayOfWeek = Day.fromKey(dateKeys[msg.dayIndex]).toDate().getDay();
        activityCounts[dayOfWeek * 24 + Math.floor(msg.secondOfDay / 3600)]++;

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

    const longestTimeWithoutMessages: PeriodStat = { minutes: -1, start: "X", end: "Y" };
    const longestActiveConversation: PeriodStat = { minutes: -1, start: "X", end: "Y" };
    // NOTE: doing it this way, we are not counting the periods in the sides (which is what we want)
    // if the first message ever is in the last 5m block of the day, it should not count 0-23.55 as "no messages"
    let prevMessage = -1, // used for time without messages
        startMessage = -1; // used for active conversations
    for (let i = 0; i < numFiveMinBlocks; i++) {
        // found a 5 minute block with messages
        if (fiveMinMessagesCount[i] > 0) {
            // [longestTimeWithoutMessages]
            // did we find one before?
            if (prevMessage !== -1) {
                // check the difference
                const diff = (i - prevMessage) * 5;
                if (diff > longestTimeWithoutMessages.minutes) {
                    longestTimeWithoutMessages.minutes = diff;
                    longestTimeWithoutMessages.start = formatTime("ymdhm", Day.fromKey(dateKeys[Math.floor(prevMessage / 288)]), (prevMessage % 288) * 5 * 60); // prettier-ignore
                    longestTimeWithoutMessages.end = formatTime("ymdhm", Day.fromKey(dateKeys[Math.floor(i / 288)]), (i % 288) * 5 * 60); // prettier-ignore
                }
            }
            // set the last message as i
            prevMessage = i;

            // [longestActiveConversation]
            if (startMessage === -1) {
                startMessage = i;
            }
            const diff = (i - startMessage + 1) * 5;
            if (diff > longestActiveConversation.minutes) {
                longestActiveConversation.minutes = diff;
                longestActiveConversation.start = formatTime("ymdhm", Day.fromKey(dateKeys[Math.floor(startMessage / 288)]), (startMessage % 288) * 5 * 60); // prettier-ignore
                longestActiveConversation.end = formatTime("ymdhm", Day.fromKey(dateKeys[Math.floor(i / 288)]), (i % 288) * 5 * 60); // prettier-ignore
            }
        } else {
            startMessage = -1;
        }
    }

    const activity: ActivityEntry[] = activityCounts.map((count, i) => {
        const weekday = Math.floor(i / 24);
        const hour = i % 24;
        return <ActivityEntry>{
            value: count,
            hour: `${hour}hs`,
            weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][weekday],
        };
    });

    const findMostActive = (counts: number[], formatFn: (index: number) => string): MostActiveEntry => {
        let max = 0,
            maxIndex = -1;
        for (let i = 0; i < counts.length; i++) {
            if (counts[i] > max) {
                max = counts[i];
                maxIndex = i;
            }
        }
        return { messages: max, text: maxIndex === -1 ? "-" : formatFn(maxIndex) };
    };

    return {
        total,
        numActiveDays: filters.numActiveDays,

        longestTimeWithoutMessages,
        longestActiveConversation,

        attachmentsCount,
        withText,
        withLinks,

        authorsCount,
        channelsCount,

        activity,
        // prettier-ignore
        mostActive: {
            hour: findMostActive(hourlyCounts, (i) => formatTime("ymdh", Day.fromKey(dateKeys[Math.floor(i / 24)]), (i % 24) * 3600)),
            day: findMostActive(dailyCounts, (i) => formatTime("ymd", Day.fromKey(dateKeys[i]))),
            month: findMostActive(monthlyCounts, (i) => formatTime("ym", Day.fromKey(monthKeys[i]))),
            year: findMostActive(yearlyCounts, (i) => formatTime("y", Day.fromKey(yearKeys[i]))),
        },
    };
};

export default {
    key: "messages-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"messages-stats", MessagesStats>;
