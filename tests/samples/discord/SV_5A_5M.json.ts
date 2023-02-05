import { AttachmentType } from "@pipeline/Attachments";

import { ExpectedPartialParseResult } from "@tests/parse/Parse";
import { ExpectedPartialDatabaseResult } from "@tests/process/Process";
import { PAUTHOR_DELETED, PAUTHOR_MLOMB } from "@tests/samples/discord/Common";

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
    authors: [PAUTHOR_DELETED, PAUTHOR_MLOMB],
    messages: [
        {
            id: "459136077417021488",
            channelId: "253601524398293010",
            textContent: "This message has been edited and written by a deleted user.",
            authorId: PAUTHOR_DELETED.id,
            timestamp: Date.parse("2018-05-20T16:09:44.209+00:00"),
            timestampEdit: Date.parse("2018-05-20T16:09:56.439+00:00"),
        },
        {
            id: "447793085255123004",
            channelId: "253601524398293010",
            textContent:
                "This author of this message does not have the nickname property, and should fallback to use name.",
            authorId: PAUTHOR_MLOMB.id,
            timestamp: Date.parse("2018-05-20T16:09:51.118+00:00"),
        },
        {
            id: "447793085255123005",
            channelId: "253601524398293010",
            authorId: PAUTHOR_MLOMB.id,
            textContent: "This message has attachments and stickers.",
            timestamp: Date.parse("2018-05-20T16:09:51.118+00:00"),
            attachments: expect.arrayContaining([AttachmentType.Image, AttachmentType.Sticker]),
        },
        {
            id: "447793085255123006",
            channelId: "253601524398293010",
            authorId: PAUTHOR_MLOMB.id,
            textContent: "This message has reactions.",
            timestamp: Date.parse("2018-05-20T16:09:51.118+00:00"),
            reactions: expect.arrayContaining([
                [{ name: "❤" }, 2],
                [{ id: "464662216386412545", name: "paul" }, 3],
            ]),
        },
    ],
};

export const expectedDatabase: ExpectedPartialDatabaseResult = {
    minDate: "2018-5-20",
    maxDate: "2018-5-20",
    langs: ["en"],
    guilds: [
        {
            name: "DefleMask",
            avatar: "https://cdn.discordapp.com/icons/253601524398293010/a_801de7dbf6c4b24d8c2c0b576c36150a.png",
        },
    ],
    channels: [
        {
            name: "general-chiptune",
            type: "text",
            guildIndex: 0,
            msgAddr: 0,
            msgCount: 5,
        },
    ],
    authors: [
        {
            n: "mlomb#5506",
            a: "111111111111111111/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        },
        {
            n: "Deleted User #555555555555555555",
        },
    ],
};
