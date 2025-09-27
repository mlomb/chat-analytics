import { AttachmentType } from "@pipeline/Attachments";

import type { ExpectedPartialParseResult } from "@tests/parse/Parse";
import { PGUILD_DEFAULT } from "@tests/samples/telegram/Common";

export const expectedParse: ExpectedPartialParseResult = {
    guilds: [PGUILD_DEFAULT],
    channels: [
        { id: 700000001, guildId: 0, type: "dm", name: "Chat One" },
        { id: 700000002, guildId: 0, type: "group", name: "Chat Two" },
    ],
    authors: [
        { id: "user300000000", name: "Alice", bot: false },
        { id: "user700000000", name: "Bob", bot: false },
        { id: "user800000000", name: "Charlie", bot: false },
        { id: "user900000000", name: "David", bot: false },
        { id: "user101000000", name: "Eve", bot: false },
    ],
    messages: [
        {
            id: "1001",
            authorId: "user300000000",
            channelId: 700000001,
            textContent: "Hello from chat one!",
            timestamp: 1672574400 * 1000,
        },
        {
            id: "1002",
            authorId: "user700000000",
            channelId: 700000001,
            textContent: "Hi there!",
            timestamp: 1672574460 * 1000,
        },
        {
            id: "2001",
            authorId: "user800000000",
            channelId: 700000002,
            textContent: "Welcome to chat two!",
            timestamp: 1672660800 * 1000,
        },
        {
            id: "2002",
            authorId: "user900000000",
            channelId: 700000002,
            textContent: "Group chat is fun!",
            timestamp: 1672660920 * 1000,
        },
        {
            id: "2004",
            attachments: [AttachmentType.Image],
            authorId: "user101000000",
            channelId: 700000002,
            timestamp: 1672747200 * 1000,
        },
    ],
    calls: [
        {
            id: "2003",
            authorId: "user800000000",
            channelId: 700000002,
            timestampStart: 1672660980 * 1000,
            timestampEnd: (1672660980 + 120) * 1000,
        },
    ],
};
