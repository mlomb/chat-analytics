import { BlockProcessFn, BlockProcessFns } from "./Blocks";

type MessagesPerCycle = {
    date: number; // timestamp
    messages: number;
};

export interface MessagesPerCycleBlock {
    perDay: MessagesPerCycle[];
    perMonth: MessagesPerCycle[];
}

const monthToString = (date: Date): string => date.getFullYear() + "-" + (date.getMonth() + 1);
const dateToString = (date: Date): string => monthToString(date) + "-" + date.getDate();

// This block IGNORES start and end dates in the filter
export const process: BlockProcessFn<MessagesPerCycleBlock> = (source, filters) => {
    const res: MessagesPerCycleBlock = {
        perDay: [],
        perMonth: [],
    };

    const dates: {
        date: Date;
        dayKey: string;
        monthKey: string;
        dayData: MessagesPerCycle;
        monthData: MessagesPerCycle;
    }[] = [];

    const start = new Date(source.minDate);
    const end = new Date(source.maxDate);
    const monthsData = new Map<string, MessagesPerCycle>();

    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
        const dayKey = dateToString(day);
        const monthKey = monthToString(day);
        let dayData = {
            date: day.getTime(),
            messages: 0,
        };
        let monthData = monthsData.get(monthKey);
        if (monthData === undefined) {
            monthData = {
                date: new Date(day.getFullYear(), day.getMonth(), 1).getTime(),
                messages: 0,
            };
            monthsData.set(monthKey, monthData);
            res.perMonth.push(monthData);
        }
        dates.push({
            date: new Date(day),
            dayKey,
            monthKey,
            dayData,
            monthData,
        });
        res.perDay.push(dayData);
    }

    for (let { dayKey, dayData, monthData } of dates) {
        for (const author of source.authors) {
            if (filters.authors.includes(author.id)) {
                for (const channelId of filters.channels) {
                    const from_user_in_channel = author.channels[channelId] || [];
                    if (dayKey in from_user_in_channel) {
                        let messages = from_user_in_channel[dayKey].messages;
                        dayData.messages += messages;
                        monthData.messages += messages;
                    }
                }
            }
        }
    }

    return res;
};

BlockProcessFns["MessagesPerCycle"] = process;
