import type { ExpectedPartialParseResult } from "@tests/parse/Parse";
import { PGUILD_DM } from "@tests/samples/discord/Common";

export const expectedParse: ExpectedPartialParseResult = {
    guilds: [PGUILD_DM],
    channels: [
        {
            id: "530805775262679064",
            type: "dm",
            avatar: undefined,
        },
    ],
    authors: [],
    messages: [],
    calls: [],
};
