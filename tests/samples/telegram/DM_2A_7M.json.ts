import { AttachmentType } from "@pipeline/Attachments";

import type { ExpectedPartialParseResult } from "@tests/parse/Parse";
import { PGUILD_DEFAULT } from "@tests/samples/telegram/Common";

export const expectedParse: ExpectedPartialParseResult = {
    guilds: [PGUILD_DEFAULT],
    channels: [{ id: 700000000, guildId: 0, type: "dm" }],
    authors: [
        { id: "user300000000", name: "Alice", bot: false },
        { id: "user700000000", name: "Bob", bot: false },
    ],
    messages: [
        {
            id: "3644",
            authorId: "user700000000",
            channelId: 700000000,
            textContent: " https://google.com  👀",
            timestamp: Date.parse("2019-07-12T16:55:32"),
        },
        {
            id: "3645",
            authorId: "user300000000",
            channelId: 700000000,
            textContent: "hello world",
            timestamp: Date.parse("2022-03-08T13:07:42"),
        },
        {
            id: "3662",
            authorId: "user700000000",
            channelId: 700000000,
            textContent: "world?",
            timestamp: 1652135033 * 1000,
        },
        {
            id: "3663",
            authorId: "user300000000",
            channelId: 700000000,
            textContent: "blah blah",
            timestamp: 1652138769 * 1000,
        },
        {
            id: "3672",
            attachments: [AttachmentType.Image],
            authorId: "user300000000",
            channelId: 700000000,
            timestamp: 1654898798 * 1000,
        },
        {
            id: "3673",
            attachments: [AttachmentType.Image],
            authorId: "user300000000",
            channelId: 700000000,
            timestamp: 1654898799 * 1000,
        },
    ],
    calls: [
        {
            id: "3674",
            authorId: "user300000000",
            channelId: 700000000,
            timestampStart: 1691719862 * 1000,
            timestampEnd: (1691719862 + 56) * 1000,
        },
    ],
};
