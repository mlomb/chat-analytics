import { AttachmentType } from "@pipeline/Attachments";
import { PAuthor, PEmoji, PMessage } from "@pipeline/parse/Types";
import { DiscordParser } from "@pipeline/parse/parsers/DiscordParser";

import { runParserFromSamples, runParserFromString } from "./Util";

const AUTHOR_MLOMB: PAuthor = {
    id: "111111111111111111",
    name: "mlomb#5506",
    bot: false,
    avatar: "111111111111111111/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
};
const AUTHOR_LOMBI: PAuthor = {
    id: "222222222222222222",
    name: "lombi#8778",
    bot: false,
};
const AUTHOR_THEPLANT: PAuthor = {
    id: "333333333333333333",
    name: "theplant#6597",
    bot: false,
};
const AUTHOR_SOMEONE: PAuthor = {
    id: "444444444444444444",
    name: "Someones nickname#1234",
    bot: true,
};
const AUTHOR_DELETED: PAuthor = {
    id: "555555555555555555",
    name: "Deleted User #555555555555555555",
    bot: false,
};

test("DM_2A_2M.json should resolve correctly", async () => {
    const parsed = await runParserFromSamples(DiscordParser, ["discord/DM_2A_2M.json"]);

    // guilds
    expect(parsed.guilds).toHaveLength(1);
    expect(parsed.guilds[0]).toHaveProperty("name", "Direct Messages");

    // channels
    expect(parsed.channels).toHaveLength(1);
    expect(parsed.channels).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                type: "dm",
            }),
        ])
    );

    // authors
    expect(parsed.authors).toEqual(
        expect.arrayContaining([expect.objectContaining(AUTHOR_MLOMB), expect.objectContaining(AUTHOR_SOMEONE)])
    );

    // messages
    expect(parsed.messages).toHaveLength(2);
    expect(parsed.messages).toStrictEqual([
        expect.objectContaining({
            id: "530805779645595660",
            authorId: AUTHOR_MLOMB.id,
            channelId: "530805775262679064",
            textContent: "blah",
            timestamp: Date.parse("2019-01-04T17:52:39.762+00:00"),
        }),
        expect.objectContaining({
            id: "538148765782114306",
            authorId: AUTHOR_SOMEONE.id,
            channelId: "530805775262679064",
            textContent: "something something text",
            timestamp: Date.parse("2019-01-25T00:11:04.083+00:00"),
        }),
    ]);
});

test("GC_3A_5M.json should resolve correctly", async () => {
    const parsed = await runParserFromSamples(DiscordParser, ["discord/GC_3A_5M.json"]);

    // guilds
    expect(parsed.guilds).toHaveLength(1);
    expect(parsed.guilds[0]).toHaveProperty("name", "Direct Messages");

    // channels
    expect(parsed.channels).toHaveLength(1);
    expect(parsed.channels).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                id: "1064990764406419508",
                type: "group",
                name: "a group chat",
                avatar: "253913584806",
            }),
        ])
    );

    // authors
    expect(parsed.authors).toEqual(
        expect.arrayContaining([
            expect.objectContaining(AUTHOR_MLOMB),
            expect.objectContaining(AUTHOR_THEPLANT),
            expect.objectContaining(AUTHOR_LOMBI),
        ])
    );

    // messages
    expect(parsed.messages).toStrictEqual([
        expect.objectContaining<PMessage>({
            id: "1064990824305274930",
            channelId: "1064990764406419508",
            textContent: "Should honor nickname over name",
            authorId: AUTHOR_THEPLANT.id,
            timestamp: Date.parse("2023-01-17T19:33:19.087+00:00"),
        }),
        expect.objectContaining<PMessage>({
            id: "1064991070322180096",
            channelId: "1064990764406419508",
            textContent: "hey!!",
            authorId: AUTHOR_LOMBI.id,
            timestamp: Date.parse("2023-01-17T19:34:17.742+00:00"),
        }),
        expect.objectContaining<PMessage>({
            id: "530805779645595660",
            channelId: "1064990764406419508",
            textContent: "hey whats up",
            authorId: AUTHOR_MLOMB.id,
            timestamp: Date.parse("2023-01-18T20:12:12.123+00:00"),
            replyTo: "1064990824305274930",
        }),
    ]);
});

test("SV_5A_5M.json should resolve correctly", async () => {
    const parsed = await runParserFromSamples(DiscordParser, ["discord/SV_5A_5M.json"]);

    // guilds
    expect(parsed.guilds).toHaveLength(1);
    expect(parsed.guilds[0]).toStrictEqual(
        expect.objectContaining({
            id: "253601524398293010",
            name: "DefleMask",
            avatar: "https://cdn.discordapp.com/icons/253601524398293010/a_801de7dbf6c4b24d8c2c0b576c36150a.png",
        })
    );

    // channels
    expect(parsed.channels).toHaveLength(1);
    expect(parsed.channels).toStrictEqual([
        expect.objectContaining({
            id: "253601524398293010",
            type: "text",
            name: "general-chiptune",
        }),
    ]);

    // authors
    expect(parsed.authors).toEqual(
        expect.arrayContaining([expect.objectContaining(AUTHOR_DELETED), expect.objectContaining(AUTHOR_MLOMB)])
    );

    // messages
    expect(parsed.messages).toEqual(
        expect.arrayContaining([
            expect.objectContaining<PMessage>({
                id: "459136077417021488",
                channelId: "253601524398293010",
                textContent: "This message has been edited and written by a deleted user.",
                authorId: AUTHOR_DELETED.id,
                timestamp: Date.parse("2018-05-20T16:09:44.209+00:00"),
                timestampEdit: Date.parse("2018-05-20T16:09:56.439+00:00"),
            }),
            expect.objectContaining<PMessage>({
                id: "447793085255123004",
                channelId: "253601524398293010",
                textContent:
                    "This author of this message does not have the nickname property, and should fallback to use name.",
                authorId: AUTHOR_MLOMB.id,
                timestamp: Date.parse("2018-05-20T16:09:51.118+00:00"),
            }),
            expect.objectContaining<PMessage>({
                id: "447793085255123005",
                channelId: "253601524398293010",
                authorId: AUTHOR_MLOMB.id,
                textContent: "This message has attachments and stickers.",
                timestamp: Date.parse("2018-05-20T16:09:51.118+00:00"),
                attachments: expect.arrayContaining([AttachmentType.Image, AttachmentType.Sticker]),
            }),
            expect.objectContaining<PMessage>({
                id: "447793085255123006",
                channelId: "253601524398293010",
                authorId: AUTHOR_MLOMB.id,
                textContent: "This message has reactions.",
                timestamp: Date.parse("2018-05-20T16:09:51.118+00:00"),
                reactions: expect.arrayContaining([
                    [{ name: "❤" }, 2],
                    [{ id: "464662216386412545", name: "paul" }, 3],
                ]),
            }),
        ])
    );
});

it("should crash if the guild information is not present before the channel", async () => {
    await expect(runParserFromString(DiscordParser, [`{ "channel": {} }`])).rejects.toThrow("Missing guild ID");
});

it("should crash if the channel information is not present before messages", async () => {
    await expect(
        runParserFromString(DiscordParser, [
            `
    { 
        "guild": {
            "id": "0",
            "name": "Direct Messages",
            "iconUrl": "https://cdn.discordapp.com/embed/avatars/0.png"
        },
        "messages": [{},{},{}]
    }`,
        ])
    ).rejects.toThrow("Missing channel ID");
});
