import { Stopwords } from "@pipeline/process/nlp/Stopwords";

import { TestEnv } from "@tests/samples";

describe("Stopwords", () => {
    let stopwords: Stopwords;

    beforeAll(async () => {
        stopwords = await Stopwords.load(TestEnv);
    });

    it("should match common stopwords", async () => {
        expect(stopwords.isStopword("the", ["en"])).toBeTrue();
        expect(stopwords.isStopword("la", ["es"])).toBeTrue();
        expect(stopwords.isStopword("boogie", ["en"])).toBeFalse();
        expect(stopwords.isStopword("calamar", ["es"])).toBeFalse();
    });
});
