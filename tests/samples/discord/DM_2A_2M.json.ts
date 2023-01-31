import type { ExpectedPartialParseResult } from "@tests/parse/Util";

import { AUTHOR_MLOMB, AUTHOR_SOMEONE, GUILD_DM } from "./Common";

export const expectedParse: ExpectedPartialParseResult = {
    guilds: [GUILD_DM],
    channels: [
        {
            id: "530805775262679064",
            type: "dm",
            avatar: undefined,
        },
    ],
    authors: [AUTHOR_MLOMB, AUTHOR_SOMEONE],
    messages: [
        {
            id: "530805779645595660",
            authorId: AUTHOR_MLOMB.id,
            channelId: "530805775262679064",
            textContent: "blah",
            timestamp: Date.parse("2019-01-04T17:52:39.762+00:00"),
        },
        {
            id: "538148765782114306",
            authorId: AUTHOR_SOMEONE.id,
            channelId: "530805775262679064",
            textContent: "something something text",
            timestamp: Date.parse("2019-01-25T00:11:04.083+00:00"),
        },
    ],
};
