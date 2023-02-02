import { Platform } from "@pipeline/Types";
import { createParser } from "@pipeline/parse";
import { Parser } from "@pipeline/parse/Parser";
import { DiscordParser } from "@pipeline/parse/parsers/DiscordParser";
import { MessengerParser } from "@pipeline/parse/parsers/MessengerParser";
import { TelegramParser } from "@pipeline/parse/parsers/TelegramParser";
import { WhatsAppParser } from "@pipeline/parse/parsers/WhatsAppParser";

import { checkSamplesAreParsedCorrectly } from "./Util";

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
