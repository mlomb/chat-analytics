import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";

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

    var date = new Date(database.time.minDate);
    date.setHours(0, 0, 0, 0);
    for (let i = 0; i < 1000; i++) {
        date.setDate(date.getDate() + 1);
        res.perDay.push({
            d: date.getTime(),
            m: Math.round(Math.random() * 100) + 3,
        });
    }

    return res;
};

export default {
    key: "messages-per-cycle",
    triggers: ["authors", "channels"],
    fn,
} as BlockDescription<"messages-per-cycle", MessagesPerCycle>;
