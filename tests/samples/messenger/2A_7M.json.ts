import { AttachmentType } from "@pipeline/Attachments";

import type { ExpectedPartialParseResult } from "@tests/parse/Parse";
import { PGUILD_DEFAULT } from "@tests/samples/messenger/Common";

export const expectedParse: ExpectedPartialParseResult = {
    guilds: [PGUILD_DEFAULT],
    channels: [{ id: "inbox/alice_aaaaaaaaaa", guildId: 0, type: "dm" }],
    authors: [
        { id: "Alice", name: "Alice", bot: false },
        { id: "Bob", name: "Bob", bot: false },
    ],
    messages: [
        {
            attachments: [AttachmentType.Image],
            authorId: "Bob",
            channelId: "inbox/alice_aaaaaaaaaa",
            textContent: undefined,
            timestamp: 1415147240411,
        },
        {
            attachments: [AttachmentType.Sticker],
            authorId: "Bob",
            channelId: "inbox/alice_aaaaaaaaaa",
            textContent: undefined,
            timestamp: 1415147254275,
        },
        {
            attachments: [AttachmentType.Audio],
            authorId: "Alice",
            channelId: "inbox/alice_aaaaaaaaaa",
            textContent: undefined,
            timestamp: 1415147297141,
        },
        {
            attachments: [AttachmentType.Other],
            authorId: "Bob",
            channelId: "inbox/alice_aaaaaaaaaa",
            textContent: undefined,
            timestamp: 1415147308604,
        },
        {
            authorId: "Bob",
            channelId: "inbox/alice_aaaaaaaaaa",
            textContent: "you what",
            timestamp: 1415147325354,
        },
        {
            authorId: "Bob",
            channelId: "inbox/alice_aaaaaaaaaa",
            textContent: "Whats up!",
            timestamp: 1415147681489,
        },
        {
            authorId: "Alice",
            channelId: "inbox/alice_aaaaaaaaaa",
            textContent: "Hello",
            timestamp: 1415147732056,
        },
    ],
    calls: [],
};
