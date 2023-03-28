import { Tag, Token, TokenMatcher, splitByToken, tokenize } from "@pipeline/process/nlp/Tokenizer";

describe("split by token", () => {
    const DIGIT_MATCHER: TokenMatcher = {
        tag: "unknown",
        // matches digits
        regex: /\d+/g,
    };

    const cases: { input: string; expected: (string | Token)[] }[] = [
        {
            input: "hello world",
            expected: ["hello world"],
        },
        {
            input: "1",
            expected: [{ text: "1", tag: "unknown" }],
        },
        {
            input: "begin 1",
            expected: ["begin", { text: "1", tag: "unknown" }],
        },
        {
            input: "1 end",
            expected: [{ text: "1", tag: "unknown" }, "end"],
        },
        {
            input: "should match → 1 ← that",
            expected: ["should match →", { text: "1", tag: "unknown" }, "← that"],
        },
        {
            input: "a1b 2 c",
            expected: ["a", { text: "1", tag: "unknown" }, "b", { text: "2", tag: "unknown" }, "c"],
        },
    ];

    test.each(cases)('should split "$input" → $expected', ({ input, expected }) => {
        expect(splitByToken(input, DIGIT_MATCHER)).toStrictEqual(expected);
    });
});

describe("should match the correct tag", () => {
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

describe("URLs", () => {
    const urlsToMatch = [
        "http://example.com",
        "https://withhttps.edu",
        "http://withlongtld.somelongtld",
        "http://withfragment.com#fragment",
        "http://withgetparam.com?a=1",
        "http://withtwogetparams.com?a=1&b=2",
        "http://withport.com:8080",
        "http://withportandpath.com:8080/path",
        "http://withportandpathandgetparam.com:8080/path?a=1",
        "http://withportandpathandgetparamandfragment.com:8080/path?a=1#fragment",
        "http://a.b.c.d.e.withsubdomains.com",
        "https://with-dashes.com/post-123456/happy-dog",
        "http://withtrailingslash.com/",
        "http://withfileextension.com/path/to/image.png",
        "http://localhost/without/tld",
        "http://www.example.com/page.html;sessionid=AAAAA&id=1234",
    ];
    const urlsNotToMatch = ["common text", "google.com", "http://", "https://", "https:// nospaces.com"];

    test.each(urlsToMatch)("should match %p", (url) => {
        const tokens = tokenize(url);
        expect(tokens.length).toBe(1);
        expect(tokens[0].text).toBe(url);
        expect(tokens[0].tag).toBe("url");
    });
    test.each(urlsNotToMatch)("should not match %p", (url) => {
        const tokens = tokenize(url);
        expect(tokens).not.toContain(
            expect.objectContaining({
                tag: "url",
            })
        );
    });
});
