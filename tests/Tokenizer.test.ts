import { Tag, tokenize } from "@pipeline/process/Tokenizer";

describe("should match tag", () => {
    const cases: [string, string, Tag][] = [
        // TODO: lots of more testing here
        // urls
        ["http://example.com", "http://example.com", "url"],
        // mentions
        ["@mention", "mention", "mention"],
        ["@123123123", "123123123", "mention"],
        // emojis
        ["🔥", "🔥", "emoji"],
        // custom emojis
        [":pepe:", "pepe", "custom-emoji"],
        // word
        ["a", "a", "word"],
        ["hello", "hello", "word"],
        ["I'm", "I'm", "word"],
        ["i18n", "i18n", "word"],
        ["m8", "m8", "word"],
    ];

    test.each(cases)("%p → %p (tag=%p)", async (input, expectedText, expectedTag) => {
        const tokens = tokenize(input);
        expect(tokens.length).toBe(1);
        expect(tokens[0].text).toBe(expectedText);
        expect(tokens[0].tag).toBe(expectedTag);
    });
});

it("exclude outside ' matching words", () => {
    const tokens = tokenize("'hello'");
    expect(tokens.length).toBe(3);
    expect(tokens[0].text).toBe("'");
    expect(tokens[1].text).toBe("hello");
    expect(tokens[1].tag).toBe("word");
    expect(tokens[2].text).toBe("'");
});
