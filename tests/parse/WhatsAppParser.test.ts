import { WhatsAppParser } from "@pipeline/parse/parsers/WhatsAppParser";

import { runParserFromSamples } from "./Util";

test("1A_3M.txt should resolve correctly", async () => {
    const parsed = await runParserFromSamples(WhatsAppParser, ["whatsapp/1A_3M.txt"]);

    // guilds
    expect(parsed.guilds).toHaveLength(1);
    expect(parsed.guilds[0]).toHaveProperty("name", "WhatsApp Chats");

    // channels
    expect(parsed.channels).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                guildId: 0,
                type: "dm",
            }),
            expect.not.objectContaining({
                type: expect.not.stringMatching("dm"),
            }),
        ])
    );

    // authors
    expect(parsed.authors).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                name: "A",
                bot: false,
            }),
            expect.objectContaining({
                name: "B",
                bot: false,
            }),
        ])
    );

    // messages
    expect(parsed.messages).toHaveLength(3);
    expect(parsed.messages).toStrictEqual([
        expect.objectContaining({
            authorId: "A",
            textContent: "Hi",
            timestamp: new Date(2021, 0, 1, 12, 0, 0).getTime(),
        }),
        expect.objectContaining({
            authorId: "B",
            textContent: "Whats up?",
            timestamp: new Date(2021, 0, 1, 12, 1, 0).getTime(),
        }),
        expect.objectContaining({
            authorId: "A",
            textContent: "All good",
            timestamp: new Date(2021, 0, 1, 12, 2, 0).getTime(),
        }),
    ]);
});

test("4A_11M.txt should resolve correctly", async () => {
    const parsed = await runParserFromSamples(WhatsAppParser, ["whatsapp/4A_11M.txt"]);

    // guilds
    expect(parsed.guilds).toHaveLength(1);
    expect(parsed.guilds[0]).toHaveProperty("name", "WhatsApp Chats");

    // channels
    expect(parsed.channels).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                guildId: 0,
                type: "group",
            }),
            expect.not.objectContaining({
                type: expect.not.stringMatching("group"),
            }),
        ])
    );

    // authors
    expect(parsed.authors).toEqual(
        expect.arrayContaining(
            ["Alice", "Bob", "Eve", "Mallory", "Trent"].map((name) =>
                expect.objectContaining({
                    name,
                    bot: false,
                })
            )
        )
    );

    // messages
    expect(parsed.messages).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                channelId: 0,
                authorId: "Alice",
                textContent: "boiii",
                timestamp: new Date(2020, 8, 12, 23, 55, 0).getTime(),
            }),
            expect.objectContaining({
                channelId: 0,
                authorId: "Trent",
                textContent: "👩🏻‍⚖️",
                timestamp: new Date(2020, 8, 12, 23, 55, 0).getTime(),
            }),
        ])
    );
});
