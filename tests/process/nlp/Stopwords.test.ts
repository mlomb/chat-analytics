import { loadNodeAsset } from "@lib/NodeEnv";
import { Stopwords } from "@pipeline/process/nlp/Stopwords";

describe("Stopwords", () => {
    let stopwords: Stopwords;

    beforeAll(async () => {
        stopwords = await Stopwords.load({ loadAsset: loadNodeAsset });
    });

    it("should match common stopwords", async () => {
        expect(stopwords.isStopword("the", ["en"])).toBe(true);
        expect(stopwords.isStopword("la", ["es"])).toBe(true);
        expect(stopwords.isStopword("boogie", ["en"])).toBe(false);
        expect(stopwords.isStopword("calamar", ["es"])).toBe(false);
    });
});
