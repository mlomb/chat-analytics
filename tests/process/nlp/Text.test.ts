import { matchFormat, normalizeText, stripDiacriticsAndSymbols } from "@pipeline/process/nlp/Text";

describe("normalizeText", () => {
    it("should remove unwanted whitespace", () => {
        expect(normalizeText("  Hello,    World!123 \t 123  ")).toEqual("Hello, World!123 123");
    });
    it("should remove the variant form 0xFE0F from emojis", () => {
        const unwanted = "☁️";
        const wanted = "☁";
        expect(unwanted).toHaveLength(2);
        expect(unwanted.charCodeAt(1)).toEqual(0xfe0f);
        expect(wanted).toHaveLength(1);
        expect(normalizeText(unwanted)).toEqual(wanted);
    });
    it("should remove the variant form 0xFE0E from emojis", () => {
        const unwanted = "📧︎";
        const wanted = "📧";
        expect(unwanted).toHaveLength(3);
        expect(unwanted.charCodeAt(2)).toEqual(0xfe0e);
        expect(wanted).toHaveLength(2);
        expect(normalizeText(unwanted)).toEqual(wanted);
    });
});

describe("stripDiacriticsAndSymbols", () => {
    it("should remove diacritics", () => {
        expect(stripDiacriticsAndSymbols("áéíóú")).toEqual("aeiou");
    });
    it("should remove symbols", () => {
        expect(stripDiacriticsAndSymbols("ⒶⒺⒾⓄⓊ")).toEqual("AEIOU");
        expect(stripDiacriticsAndSymbols("ⓐⓔⓘⓞⓤ")).toEqual("aeiou");
    });
});

describe("matchFormat", () => {
    it("should be case insensitive", () => {
        expect(matchFormat("HeLlO")).toEqual("hello");
        expect(matchFormat("ÁaÉeÍiÓoÚu")).toEqual("aaeeiioouu");
    });
    it("should format weird symbols correctly", () => {
        // weird channel names people may use
        expect(matchFormat("𝔤𝔢𝔫𝔢𝔯𝔞𝔩")).toEqual("general");
        expect(matchFormat("𝔾𝔼ℕ𝔼ℝ𝔸𝕃")).toEqual("general");
        expect(matchFormat("ⒼⒺⓃⒺⓇⒶⓁ")).toEqual("general");
        expect(matchFormat("ģe𝕟𝑒ℝＡĻ")).toEqual("general");
        expect(matchFormat("𝓖𝓔𝓝𝓔𝓡𝓐𝓛")).toEqual("general");
    });
});
