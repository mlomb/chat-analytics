import type { ExpectedPartialParseResult } from "@tests/parse/Parse";
import { PAUTHOR_LOMBI, PAUTHOR_MLOMB, PAUTHOR_THEPLANT, PGUILD_DM } from "@tests/samples/discord/Common";

export const expectedParse: ExpectedPartialParseResult = {
    guilds: [PGUILD_DM],
    channels: [
        {
            id: "1064990764406419508",
            guildId: "0",
            type: "group",
            name: "a group chat",
            avatar: "253913584806",
        },
    ],
    authors: [PAUTHOR_MLOMB, PAUTHOR_THEPLANT, PAUTHOR_LOMBI],
    messages: [
        {
            id: "1064990824305274930",
            channelId: "1064990764406419508",
            textContent: "Should honor nickname over name",
            authorId: PAUTHOR_THEPLANT.id,
            timestamp: Date.parse("2023-01-17T19:33:19.087+00:00"),
        },
        {
            id: "1064991070322180096",
            channelId: "1064990764406419508",
            textContent: "hey!!",
            authorId: PAUTHOR_LOMBI.id,
            timestamp: Date.parse("2023-01-17T19:34:17.742+00:00"),
        },
        {
            id: "530805779645595660",
            channelId: "1064990764406419508",
            textContent: "hey whats up",
            authorId: PAUTHOR_MLOMB.id,
            timestamp: Date.parse("2023-01-18T20:12:12.123+00:00"),
            replyTo: "1064990824305274930",
        },
    ],
};
