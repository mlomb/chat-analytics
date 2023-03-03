import type { ExpectedPartialParseResult } from "@tests/parse/Parse";
import { PAUTHOR_MLOMB, PAUTHOR_SOMEONE, PGUILD_DM } from "@tests/samples/discord/Common";

export const expectedParse: ExpectedPartialParseResult = {
    guilds: [PGUILD_DM],
    channels: [
        {
            id: "530805775262679064",
            type: "dm",
            avatar: undefined,
        },
    ],
    authors: [PAUTHOR_MLOMB, PAUTHOR_SOMEONE],
    messages: [
        {
            id: "530805779645595660",
            authorId: PAUTHOR_MLOMB.id,
            channelId: "530805775262679064",
            textContent: "blah",
            timestamp: Date.parse("2019-01-04T17:52:39.762+00:00"),
            reactions: [[{ text: "👆" }, 42]],
        },
        {
            id: "538148765782114306",
            authorId: PAUTHOR_SOMEONE.id,
            channelId: "530805775262679064",
            textContent: "something something text",
            timestamp: Date.parse("2019-01-25T00:11:04.083+00:00"),
        },
    ],
};
