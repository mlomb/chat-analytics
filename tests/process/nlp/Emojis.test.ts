import { loadNodeAsset } from "@lib/NodeEnv";
import { Emojis } from "@pipeline/process/nlp/Emojis";

describe("Emojis", () => {
    let emojis: Emojis;

    beforeAll(async () => {
        emojis = await Emojis.load({ loadAsset: loadNodeAsset });
    });

    it("should have the name of common emojis", async () => {
        expect(emojis.getName("😀")).toBe("grinning face");
        expect(emojis.getName("💚")).toBe("green heart");
    });

    it("should return correct sentiment for common emojis", async () => {
        expect(emojis.getSentiment("😡")).toBeNegative();
        expect(emojis.getSentiment("❤")).toBePositive();
        expect(emojis.getSentiment("🟪")).toBe(0); // rare emoji
    });
});
