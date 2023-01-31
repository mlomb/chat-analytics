import { AttachmentType } from "@pipeline/Attachments";
import type { ExpectedPartialParseResult } from "@tests/parse/Util";

import { AUTHOR_DELETED, AUTHOR_MLOMB } from "./Common";

export const expectedParse: ExpectedPartialParseResult = {
    guilds: [
        {
            id: "253601524398293010",
            name: "DefleMask",
            avatar: "https://cdn.discordapp.com/icons/253601524398293010/a_801de7dbf6c4b24d8c2c0b576c36150a.png",
        },
    ],
    channels: [
        {
            id: "253601524398293010",
            type: "text",
            name: "general-chiptune",
        },
    ],
    authors: [AUTHOR_DELETED, AUTHOR_MLOMB],
    messages: [
        {
            id: "459136077417021488",
            channelId: "253601524398293010",
            textContent: "This message has been edited and written by a deleted user.",
            authorId: AUTHOR_DELETED.id,
            timestamp: Date.parse("2018-05-20T16:09:44.209+00:00"),
            timestampEdit: Date.parse("2018-05-20T16:09:56.439+00:00"),
        },
        {
            id: "447793085255123004",
            channelId: "253601524398293010",
            textContent:
                "This author of this message does not have the nickname property, and should fallback to use name.",
            authorId: AUTHOR_MLOMB.id,
            timestamp: Date.parse("2018-05-20T16:09:51.118+00:00"),
        },
        {
            id: "447793085255123005",
            channelId: "253601524398293010",
            authorId: AUTHOR_MLOMB.id,
            textContent: "This message has attachments and stickers.",
            timestamp: Date.parse("2018-05-20T16:09:51.118+00:00"),
            attachments: expect.arrayContaining([AttachmentType.Image, AttachmentType.Sticker]),
        },
        {
            id: "447793085255123006",
            channelId: "253601524398293010",
            authorId: AUTHOR_MLOMB.id,
            textContent: "This message has reactions.",
            timestamp: Date.parse("2018-05-20T16:09:51.118+00:00"),
            reactions: expect.arrayContaining([
                [{ name: "❤" }, 2],
                [{ id: "464662216386412545", name: "paul" }, 3],
            ]),
        },
    ],
};
