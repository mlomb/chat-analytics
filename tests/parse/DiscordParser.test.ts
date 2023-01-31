import { DiscordParser } from "@pipeline/parse/parsers/DiscordParser";

import { checkSamplesAreParsedCorrectly, runParserFromString } from "./Util";

describe("should resolve correctly", () => {
    // prettier-ignore
    const cases = [
        [["DM_2A_2M"]],
        [["GC_3A_5M"]],
        [["SV_5A_5M"]],
        [["DM_2A_2M", "GC_3A_5M", "SV_5A_5M"]]
    ];

    test.each(cases)(
        "%s",
        async (filenames) =>
            await checkSamplesAreParsedCorrectly(
                DiscordParser,
                filenames.map((filename) => `discord/${filename}.json`)
            )
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
