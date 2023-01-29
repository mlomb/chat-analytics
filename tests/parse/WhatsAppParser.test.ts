import { WhatsAppParser } from "@pipeline/parse/parsers/WhatsAppParser";

import { runParser } from "./Util";

const sample1 = `
1/1/21, 12:00 - A: Hi
1/1/21, 12:01 - B: Whats up?
1/1/21, 12:02 - A: All good`;

it("sample1 should resolve correctly", async () => {
    const parsed = await runParser(WhatsAppParser, [sample1]);

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
