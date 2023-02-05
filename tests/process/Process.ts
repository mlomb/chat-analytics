import { Platform } from "@pipeline/Platforms";
import { DateKey } from "@pipeline/Time";
import { generateDatabase } from "@pipeline/index";
import { Author, Channel, Guild } from "@pipeline/process/Types";

import { TestEnv, loadSamples } from "@tests/samples";

/** The data we expect after to be included after generating the Database */
export interface ExpectedPartialDatabaseResult {
    minDate: DateKey;
    maxDate: DateKey;
    langs: string[];
    guilds: Partial<Guild>[];
    channels: Partial<Channel>[];
    authors: Partial<Author>[];
}

/** Checks if a group of samples matches the set of expected parse results */
export const checkDatabaseIsGeneratedCorrectly = async (platform: Platform, filenames: string[]) => {
    const samples = await loadSamples(filenames);
    const db = await generateDatabase(
        samples.map((s) => s.input),
        { platform },
        TestEnv
    );

    for (const sample of samples) {
        const expected = sample.expectedDatabase;

        expect(db.time.minDate).toBe(expected.minDate);
        expect(db.time.maxDate).toBe(expected.maxDate);
        expect(db.langs).toIncludeAllMembers(expected.langs);
        expect(db.guilds).toIncludeAllPartialMembers(expected.guilds);
        expect(db.channels).toIncludeAllPartialMembers(expected.channels);
        expect(db.authors).toIncludeAllPartialMembers(expected.authors);
    }
};
