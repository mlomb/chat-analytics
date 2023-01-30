import { loadNodeAsset } from "@lib/NodeEnv";
import { FastTextLID176Model } from "@pipeline/process/nlp/FastTextModel";

describe("FastTextLID176Model", () => {
    let model: FastTextLID176Model;

    beforeAll(async () => {
        model = await FastTextLID176Model.load({ loadAsset: loadNodeAsset });
    });

    it("should predict common languages correctly", async () => {
        expect(model.identifyLanguage("This text is in english!")).toHaveProperty("iso639", "en");
        expect(model.identifyLanguage("¡Este texto está en español!")).toHaveProperty("iso639", "es");
    });
});
