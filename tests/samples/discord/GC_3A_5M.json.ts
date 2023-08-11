import { getLanguageIndexByCode } from "@pipeline/Languages";

import type { ExpectedPartialParseResult } from "@tests/parse/Parse";
import { ExpectedPartialDatabaseResult } from "@tests/process/Process";
import {
    AUTHOR_LOMBI,
    AUTHOR_MLOMB,
    AUTHOR_THEPLANT,
    PAUTHOR_LOMBI,
    PAUTHOR_MLOMB,
    PAUTHOR_THEPLANT,
    PGUILD_DM,
} from "@tests/samples/discord/Common";

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
            textContent: "hey @mlomb whats up, check out https://chatanalytics.app",
            authorId: PAUTHOR_LOMBI.id,
            timestamp: Date.parse("2023-01-17T19:34:17.742+00:00"),
        },
        {
            id: "530805779645595660",
            channelId: "1064990764406419508",
            textContent: "woah nice :custom_emoji:",
            authorId: PAUTHOR_MLOMB.id,
            timestamp: Date.parse("2023-01-18T20:12:12.123+00:00"),
            replyTo: "1064990824305274930",
        },
    ],
    calls: [],
};

export const expectedDatabase: ExpectedPartialDatabaseResult = {
    minDate: "2023-01-17",
    maxDate: "2023-01-18",
    langs: ["en"],
    guild: { name: PGUILD_DM.name },
    channel: {
        name: "a group chat",
        type: "group",
        avatar: "253913584806",
    },
    authors: [AUTHOR_THEPLANT, AUTHOR_LOMBI, AUTHOR_MLOMB],
    messages: [
        {
            authorName: AUTHOR_THEPLANT.n,
            langIndex: getLanguageIndexByCode("en"),
            words: [
                // stopwords: should over name
                ["honor", 1],
                ["nickname", 1],
            ],
        },
        {
            authorName: AUTHOR_LOMBI.n,
            langIndex: getLanguageIndexByCode("en"),
            words: [
                // stopwords: whats up out
                ["hey", 1],
                ["check", 1],
            ],
            mentions: [["mlomb", 1]],
            domains: [["chatanalytics.app", 1]],
        },
        {
            authorName: AUTHOR_MLOMB.n,
            langIndex: getLanguageIndexByCode("en"),
            words: [
                ["woah", 1],
                ["nice", 1],
            ],
            // TODO: test custom_emoji
        },
    ],
};
