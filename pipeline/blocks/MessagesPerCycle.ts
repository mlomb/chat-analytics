import { BlockProcessFn, BlocksDesc, BlocksProcessFn } from "@pipeline/blocks/Blocks";
import { dateToString, monthToString } from "@pipeline/Utils";

type MessagesPerCycle = {
    date: number; // timestamp
    messages: number;
};

export interface MessagesPerCycleBlock {
    perDay: MessagesPerCycle[];
    perMonth: MessagesPerCycle[];
}

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

    for (const author of source.authors) {
        if (filters.authors.includes(author.id)) {
            for (const channelId of filters.channels) {
                if (channelId in author.aggrs) {
                    for (const { dayKey, dayData, monthData } of dates) {
                        const dayAggr = author.aggrs[dayKey][channelId];
                        dayData.messages += dayAggr.m;
                        monthData.messages += dayAggr.m;
                    }
                }
            }
        }
    }

    return res;
};

BlocksProcessFn["MessagesPerCycle"] = process;
BlocksDesc["MessagesPerCycle"] = {
    triggers: ["authors", "channels"],
};
