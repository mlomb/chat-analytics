import { Database, generateReport } from "@lib/index";
import { compressDatabase } from "@pipeline/compression/Compression";
import { DefaultMessageBitConfig } from "@pipeline/serialization/MessageSerialization";

import { TestEnv } from "@tests/samples";

test("report should contain data and title", async () => {
    const db: Database = {
        config: {
            platform: "discord",
        },
        generatedAt: "2023-02-14T00:36:19.676Z",
        title: "This is the report title that should end up in the title of the report HTML",
        langs: ["en"],
        time: {
            minDate: "2020-01-01",
            maxDate: "2020-01-01",
            numDays: 1,
            numMonths: 1,
            numYears: 1,
        },
        guilds: [],
        channels: [],
        authors: [],
        emojis: [],
        words: [],
        mentions: [],
        domains: [],
        messages: new Uint8Array(256),
        numMessages: 12,
        bitConfig: DefaultMessageBitConfig,
    };

    const report = await generateReport(db, TestEnv);

    expect(report.html).toContain('<div id="app">');
    expect(report.html).toMatch(new RegExp(`<title>${db.title}`, "g"));
    expect(report.data).toEqual(compressDatabase(db));
});
