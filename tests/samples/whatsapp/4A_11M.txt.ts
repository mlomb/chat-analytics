import type { ExpectedPartialParseResult } from "@tests/parse/Parse";
import { PGUILD_DEFAULT } from "@tests/samples/whatsapp/Common";

export const expectedParse: ExpectedPartialParseResult = {
    guilds: [PGUILD_DEFAULT],
    channels: [
        {
            guildId: 0,
            type: "group",
        },
    ],
    authors: ["Alice", "Bob", "Eve", "Mallory", "Trent"].map((name) => ({
        name,
        bot: false,
    })),
    messages: [
        {
            channelId: 0,
            authorId: "Alice",
            textContent: "boiii",
            timestamp: new Date(2020, 8, 12, 23, 55, 0).getTime(),
        },
        {
            channelId: 0,
            authorId: "Trent",
            textContent: "👩🏻‍⚖️",
            timestamp: new Date(2020, 8, 12, 23, 55, 0).getTime(),
        },
    ],
};
