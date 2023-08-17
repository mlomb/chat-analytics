import { AttachmentType } from "@pipeline/Attachments";
import { Datetime } from "@pipeline/Time";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { WeekdayHourEntry } from "@pipeline/aggregate/Common";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

interface MostActiveEntry {
    messages: number;
    at?: Datetime;
}

export interface MessagesStats {
    /** Total number of messages sent */
    total: number;
    /** Total number of messages edited */
    edited: number;
    /** Number of active days given the time filter */
    numActiveDays: number;

    /** Number of messages that contain attachments of each type */
    withAttachmentsCount: { [type in AttachmentType]: number };
    /** Number of messages that contain text */
    withText: number;
    /** Number of messages that contain links */
    withLinks: number;

    counts: {
        /** Number of messages edited by each author */
        authors: number[];
        /** Number of messages edited in each channel */
        channels: number[];
    };

    weekdayHourActivity: WeekdayHourEntry[];

    mostActive: {
        hour: MostActiveEntry;
        day: MostActiveEntry;
        month: MostActiveEntry;
        year: MostActiveEntry;
    };
}

const fn: BlockFn<MessagesStats> = (database, filters, common, args) => {
    const { dateKeys, weekKeys, monthKeys, yearKeys, dateToWeekIndex, dateToMonthIndex, dateToYearIndex } =
        common.timeKeys;

    let total = 0,
        edited = 0,
        withText = 0,
        withLinks = 0;
    const authorsCount = new Array(database.authors.length).fill(0);
    const channelsCount = new Array(database.channels.length).fill(0);
    const attachmentsCount = {
        [AttachmentType.Image]: 0,
        [AttachmentType.ImageAnimated]: 0,
        [AttachmentType.Video]: 0,
        [AttachmentType.Sticker]: 0,
        [AttachmentType.Audio]: 0,
        [AttachmentType.Document]: 0,
        [AttachmentType.Other]: 0,
    };

    const hourlyCounts: number[] = new Array(24 * database.time.numDays).fill(0);
    const dailyCounts: number[] = new Array(database.time.numDays).fill(0);
    const monthlyCounts: number[] = new Array(database.time.numMonths).fill(0);
    const yearlyCounts: number[] = new Array(database.time.numYears).fill(0);
    const weekdayHourCounts: number[] = new Array(7 * 24).fill(0);

    const processMessage = (msg: MessageView) => {
        total++;
        if (msg.hasEdits) edited++;
        if (msg.hasDomains) withLinks++;
        if (msg.langIndex !== undefined) withText++;

        authorsCount[msg.authorIndex]++;
        channelsCount[msg.channelIndex]++;
        hourlyCounts[msg.dayIndex * 24 + Math.floor(msg.secondOfDay / 3600)]++;
        dailyCounts[msg.dayIndex]++;
        monthlyCounts[dateToMonthIndex[msg.dayIndex]]++;
        yearlyCounts[dateToYearIndex[msg.dayIndex]]++;

        const dayOfWeek = common.dayOfWeek[msg.dayIndex];
        weekdayHourCounts[dayOfWeek * 24 + Math.floor(msg.secondOfDay / 3600)]++;

        const attachments = msg.attachments;
        if (attachments) {
            for (const attachment of attachments) {
                attachmentsCount[attachment[0]] += attachment[1];
            }
        }
    };

    filterMessages(processMessage, database, filters);

    const weekdayHourActivity: WeekdayHourEntry[] = weekdayHourCounts.map((count, i) => {
        const weekday = Math.floor(i / 24);
        const hour = i % 24;
        return {
            value: count,
            hour: `${hour}hs`,
            weekday: (["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const)[weekday],
        };
    });

    const findMostActive = (counts: number[], buildDatetimeFn: (index: number) => Datetime): MostActiveEntry => {
        let max = 0,
            maxIndex = -1;
        for (let i = 0; i < counts.length; i++) {
            if (counts[i] > max) {
                max = counts[i];
                maxIndex = i;
            }
        }
        return { messages: max, at: maxIndex === -1 ? undefined : buildDatetimeFn(maxIndex) };
    };

    return {
        total,
        edited,
        numActiveDays: filters.numActiveDays,

        withAttachmentsCount: attachmentsCount,
        withText,
        withLinks,

        counts: {
            authors: authorsCount,
            channels: channelsCount,
        },

        weekdayHourActivity,

        // prettier-ignore
        mostActive: {
            hour: findMostActive(hourlyCounts, i => ({ key: dateKeys[Math.floor(i / 24)], secondOfDay: (i % 24) * 3600 })),
            day: findMostActive(dailyCounts, i => ({ key: dateKeys[i] })),
            month: findMostActive(monthlyCounts, i => ({ key: monthKeys[i] })),
            year: findMostActive(yearlyCounts, i => ({ key: yearKeys[i] })),
        },
    };
};

export default {
    key: "messages/stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"messages/stats", MessagesStats>;
