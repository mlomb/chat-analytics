import { DiscordParser } from "@pipeline/parse/parsers/DiscordParser";

import { runParserFromString } from "./Util";

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
