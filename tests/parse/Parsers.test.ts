import { Platform } from "@pipeline/Platforms";
import { Timestamp } from "@pipeline/Types";
import { createParser } from "@pipeline/parse";
import { tryToFindTimestampAtEnd, wrapStringAsFile } from "@pipeline/parse/File";
import { Parser } from "@pipeline/parse/Parser";
import { DiscordParser } from "@pipeline/parse/parsers/DiscordParser";
import { MessengerParser } from "@pipeline/parse/parsers/MessengerParser";
import { TelegramParser } from "@pipeline/parse/parsers/TelegramParser";
import { WhatsAppParser } from "@pipeline/parse/parsers/WhatsAppParser";

import { checkSamplesAreParsedCorrectly } from "@tests/parse/Parse";
import { loadSample } from "@tests/samples";

describe("should parse correctly", () => {
    // prettier-ignore
    const cases: { parser: new () => Parser; inputs: string[] }[] = [
        { parser: DiscordParser, inputs: ["discord/DM_2A_2M.json"] },
        { parser: DiscordParser, inputs: ["discord/GC_3A_5M.json"] },
        { parser: DiscordParser, inputs: ["discord/SV_5A_5M.json"] },
        { parser: DiscordParser, inputs: ["discord/DM_2A_2M.json", "discord/GC_3A_5M.json", "discord/SV_5A_5M.json"] },

        { parser: WhatsAppParser, inputs: ["whatsapp/2A_5M.txt"] },
        { parser: WhatsAppParser, inputs: ["whatsapp/4A_11M.txt"] },
        { parser: WhatsAppParser, inputs: ["whatsapp/4A_11M.zip"] },

        { parser: TelegramParser, inputs: ["telegram/DM_2A_7M.json"] },

        { parser: MessengerParser, inputs: ["messenger/2A_7M.json"] },

        // TODO: add more, cover branches
        // Telegram and Messenger need more samples
    ];

    test.each(cases)("$inputs", async ({ parser, inputs }) => await checkSamplesAreParsedCorrectly(parser, inputs));
});

describe("createParser should return the correct parser", () => {
    test.each<[Platform, new () => Parser]>([
        ["discord", DiscordParser],
        ["whatsapp", WhatsAppParser],
        ["telegram", TelegramParser],
        ["messenger", MessengerParser],
    ])("%s", async (platform, expectedClass) => {
        expect(createParser(platform)).toBeInstanceOf(expectedClass);
    });
});

describe("timestamp of the last message at the end of the file", () => {
    // prettier-ignore
    const cases: { file: string; regex: RegExp; lastMessageTimestamp: Timestamp }[] = [
        { file: "discord/DM_2A_2M.json", regex: DiscordParser.TS_MSG_REGEX, lastMessageTimestamp: new Date("2020-07-17T17:03:14.366+00:00").getTime() },
        { file: "discord/GC_3A_5M.json", regex: DiscordParser.TS_MSG_REGEX, lastMessageTimestamp: new Date("2023-01-18T20:12:12.123+00:00").getTime() },
        { file: "discord/SV_5A_5M.json", regex: DiscordParser.TS_MSG_REGEX, lastMessageTimestamp: new Date("2018-05-20T16:09:51.118+00:00").getTime() },

        { file: "telegram/DM_2A_7M.json", regex: TelegramParser.TS_MSG_REGEX, lastMessageTimestamp: 1691719862 },
    ];

    test.each(cases)("$file", async ({ file, regex, lastMessageTimestamp }) => {
        const ts = await tryToFindTimestampAtEnd(regex, (await loadSample(file)).input);
        expect(ts).toBe(lastMessageTimestamp);
    });

    test("should return undefined if no timestamp is found", async () => {
        const ts = await tryToFindTimestampAtEnd(DiscordParser.TS_MSG_REGEX, wrapStringAsFile("hello world"));
        expect(ts).toBeUndefined();
    });
});
