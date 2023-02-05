import { LanguageCodes } from "@pipeline/Languages";
import { Emojis } from "@pipeline/process/nlp/Emojis";
import { Sentiment } from "@pipeline/process/nlp/Sentiment";
import { tokenize } from "@pipeline/process/nlp/Tokenizer";

import { TestEnv } from "@tests/samples";

describe("Sentiment", () => {
    let sentiment: Sentiment;

    beforeAll(async () => {
        sentiment = await Sentiment.load(TestEnv, await Emojis.load(TestEnv));
    });

    it("should detect sentiment in basic sentences", () => {
        expect(sentiment.calculate(tokenize("i love you"), LanguageCodes.indexOf("en"))).toBePositive();
        expect(sentiment.calculate(tokenize("i hate you"), LanguageCodes.indexOf("en"))).toBeNegative();
    });
});
