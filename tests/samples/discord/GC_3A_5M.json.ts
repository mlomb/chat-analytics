import type { ExpectedPartialParseResult } from "@tests/parse/Util";

import { AUTHOR_LOMBI, AUTHOR_MLOMB, AUTHOR_THEPLANT, GUILD_DM } from "./Common";

export const expectedParse: ExpectedPartialParseResult = {
    guilds: [GUILD_DM],
    channels: [
        {
            id: "1064990764406419508",
            guildId: "0",
            type: "group",
            name: "a group chat",
            avatar: "253913584806",
        },
    ],
    authors: [AUTHOR_MLOMB, AUTHOR_THEPLANT, AUTHOR_LOMBI],
    messages: [
        {
            id: "1064990824305274930",
            channelId: "1064990764406419508",
            textContent: "Should honor nickname over name",
            authorId: AUTHOR_THEPLANT.id,
            timestamp: Date.parse("2023-01-17T19:33:19.087+00:00"),
        },
        {
            id: "1064991070322180096",
            channelId: "1064990764406419508",
            textContent: "hey!!",
            authorId: AUTHOR_LOMBI.id,
            timestamp: Date.parse("2023-01-17T19:34:17.742+00:00"),
        },
        {
            id: "530805779645595660",
            channelId: "1064990764406419508",
            textContent: "hey whats up",
            authorId: AUTHOR_MLOMB.id,
            timestamp: Date.parse("2023-01-18T20:12:12.123+00:00"),
            replyTo: "1064990824305274930",
        },
    ],
};
