import { ID } from "@pipeline/Types";
import { BlockProcessFn, BlocksDesc, BlocksProcessFn } from "@pipeline/blocks/Blocks";

type MessagesPerCycle = {
    date: number; // timestamp
    messages: number;
};

export interface MessagesPerCycleBlock {
    perDay: MessagesPerCycle[];
    perMonth: MessagesPerCycle[];
}

export const process: BlockProcessFn<MessagesPerCycleBlock> = (source, deserializer, filters) => {
    const res: MessagesPerCycleBlock = {
        perDay: [],
        perMonth: [],
    };

    // fill empty
    for (let i = 0; i < source.time.numDays; i++) {
        const d = new Date(source.time.minDate);
        d.setDate(d.getDate() + i);
        res.perDay.push({
            date: d.getTime(),
            messages: 0,
        });
    }
    for (let i = 0; i < source.time.numMonths; i++) {
        const d = new Date(source.time.minDate);
        d.setMonth(d.getMonth() + i);
        res.perMonth.push({
            date: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
            messages: 0,
        });
    }

    const processMessage = (dateIndex: number, monthIndex: number, hour: number, authorId: ID) => {
        if (filters.hasAuthor(authorId)) {
            res.perDay[dateIndex].messages++;
            res.perMonth[monthIndex].messages++;
        }
    };

    for (let channelId = 0; channelId < source.channels.length; channelId++) {
        const channel = source.channels[channelId];
        if (filters.hasChannel(channelId)) {
            deserializer.readMessages(channel.msgAddr, channel.msgCount, processMessage);
        }
    }

    return res;
};

BlocksProcessFn["MessagesPerCycle"] = process;
BlocksDesc["MessagesPerCycle"] = {
    triggers: ["authors", "channels"],
};
