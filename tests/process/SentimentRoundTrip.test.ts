import fs from "fs";
import path from "path";

import { computeCommonBlockData } from "@pipeline/aggregate/Common";
import { Filters } from "@pipeline/aggregate/Filters";
import SentimentStats from "@pipeline/aggregate/blocks/sentiment/SentimentStats";
import { generateDatabase } from "@pipeline/index";
import { FileInput } from "@pipeline/parse/File";

import { TestEnv } from "@tests/samples";

it("keeps text without sentiment evidence unscored through database serialization and report aggregation", async () => {
    const input = JSON.parse(fs.readFileSync(path.join(__dirname, "../samples/discord/SV_5A_5M.json"), "utf8"));
    for (const message of input.messages) {
        message.content = "xyzzy plover";
        message.embeds = [];
        message.attachments = [];
    }
    const bytes = new TextEncoder().encode(JSON.stringify(input));
    const file: FileInput = {
        name: "unscored.json",
        size: bytes.length,
        lastModified: 0,
        slice: async (start, end) => bytes.slice(start, end).buffer,
    };
    const database = await generateDatabase([file], { platform: "discord" }, TestEnv);
    const filters = new Filters(database);
    filters.updateAuthors(database.authors.map((_, i) => i));
    filters.updateChannels(database.channels.map((_, i) => i));
    filters.updateStartDate(database.time.minDate);
    filters.updateEndDate(database.time.maxDate);
    const stats = SentimentStats.fn(database, filters, computeCommonBlockData(database), undefined);
    expect(stats).toEqual({
        totalMessages: input.messages.length,
        unscoredMessages: input.messages.length,
        positiveMessages: 0,
        negativeMessages: 0,
        neutralMessages: 0,
    });
});
