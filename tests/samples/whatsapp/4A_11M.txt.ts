import type { ExpectedPartialParseResult } from "@tests/parse/Util";

import { GUILD_DEFAULT } from "./Common";

export const expectedParse: ExpectedPartialParseResult = {
    guilds: [GUILD_DEFAULT],
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
