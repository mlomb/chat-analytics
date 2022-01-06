import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { BitStream } from "@pipeline/report/BitStream";
import { readMessage } from "@pipeline/report/Serialization";

type MessagesInDate = {
    d: number; // date, as timestamp
    m: number; // messages
};

export interface MessagesPerCycle {
    perDay: MessagesInDate[];
    perMonth: MessagesInDate[];
}

const fn: BlockFn<MessagesPerCycle> = (database, filters) => {
    const res: MessagesPerCycle = {
        perDay: [],
        perMonth: [],
    };
    console.log(database, filters);

    // fill empty
    for (let i = 0; i < database.time.numDays; i++) {
        const d = new Date(database.time.minDate);
        d.setDate(d.getDate() + i);
        res.perDay.push({
            d: d.getTime(),
            m: 0,
        });
    }
    for (let i = 0; i < database.time.numMonths; i++) {
        const d = new Date(database.time.minDate);
        d.setMonth(d.getMonth() + i);
        res.perMonth.push({
            d: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
            m: 0,
        });
    }

    const stream = new BitStream(database.serialized);
    for (const channel of database.channels) {
        // seek
        stream.offset = channel.msgAddr;

        // read messages
        for (let read = 0; read < channel.msgCount; read++) {
            const message = readMessage(stream, database.bitConfig);
            res.perDay[message.dayIndex].m++;
        }
    }
    readMessage;

    return res;
};

export default {
    key: "messages-per-cycle",
    triggers: ["authors", "channels"],
    fn,
} as BlockDescription<"messages-per-cycle", MessagesPerCycle>;
