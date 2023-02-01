import { Parser } from "@pipeline/parse/Parser";
import { DiscordParser } from "@pipeline/parse/parsers/DiscordParser";
import { TelegramParser } from "@pipeline/parse/parsers/TelegramParser";
import { WhatsAppParser } from "@pipeline/parse/parsers/WhatsAppParser";

import { checkSamplesAreParsedCorrectly } from "./Util";

describe("should resolve correctly", () => {
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

        // TODO: add more, cover branches
    ];

    test.each(cases)("$inputs", async ({ parser, inputs }) => await checkSamplesAreParsedCorrectly(parser, inputs));
});
