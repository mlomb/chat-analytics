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
    const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
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

    const _MS_PER_DAY = 1000 * 60 * 60 * 24;

    for (let channelId = 0; channelId < source.channels.length; channelId++) {
        const channel = source.channels[channelId];
        if (filters.channelsSet.has(channelId)) {
            for (const message of channel.messages) {
                if (filters.authorsSet.has(message.authorId)) {
                    const dateUTC = Date.UTC(message.date[0], message.date[1], message.date[2]);

                    const index = Math.floor((dateUTC - startUTC) / _MS_PER_DAY);
                    console.assert(index >= 0 && index < dates.length);

                    const dateData = dates[index];
                    dateData.dayData.messages++;
                    dateData.monthData.messages++;
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
