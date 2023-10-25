import emojiRegex from "emoji-regex";

/*
    We are currently using a simple regex-based tokenizer.
    It is not perfect, but it works for now. Its main disadvantage is that it
    only works for Latin-based and similar languages. We should probably use a more
    sophisticated tokenizer in the future.
    
    Citing fastText tokenizer:
    > We used the Stanford word segmenter for Chinese, Mecab for Japanese and
    > UETsegmenter for Vietnamese. For languages using the Latin, Cyrillic, Hebrew
    > or Greek scripts, we used the tokenizer from the Europarl preprocessing tools.
    > For the remaining languages, we used the ICU tokenizer.
    > (source: https://fasttext.cc/docs/en/crawl-vectors.html)
    Migrating these is a lot of work.
    I didn't find a good library for this, so we would have to implement it ourselves.
    Also, I only know well Spanish and English, so I need help here.

    But we also have another problem, we don't know beforehand what language the
    messages are in. Asking the user may only work sometimes since people can be
    multilingual in the same conversation and servers may have different languages per channel.
    We could switch tokenizers based on the language of the message detected by fastText,
    but my tests showed that it is not very accurate. 😔
    https://i.imgflip.com/4hkogk.jpg
*/

export type Tag = "code" | "url" | "mention" | "emoji" | "custom-emoji" | "word" | "unknown";

export interface Token {
    text: string;
    tag: Tag;
}

export interface TokenMatcher {
    /** What kind of token is being matched */
    tag: Tag;
    /** Regex pattern to search for this token */
    regex: RegExp;
    /** Optionally applies a transformation to the matched text */
    transform?: (match: string) => string;
}

// the order of the matchers is critical
const Matchers: Readonly<TokenMatcher[]> = [
    {
        // should we handle it this way?
        // source code, ascii art, some other stuff should not be included
        regex: /```[^`]*```/g,
        tag: "code",
    },
    {
        // match URLs
        regex: /https?:\/\/[^\s<]+[^<.,:;"')\]\s]/g, // Discord's regex to match URLs
        tag: "url",
    },
    // TODO: match emails, so they are not parsed as mentions (@gmail, @hotmail, etc)
    {
        // match @mentions
        regex: /@[\p{L}_0-9]+/giu,
        tag: "mention",
        transform: (match) => match.slice(1), // remove @
    },
    {
        // match emojis 🔥
        regex: emojiRegex(),
        tag: "emoji",
    },
    {
        // match custom emojis :pepe:
        regex: /:\w+:/gi,
        tag: "custom-emoji",
        transform: (match) => match.slice(1, -1), // remove :
    },
    // TODO: match words on languages that words are one character (help wanted)
    // See: https://github.com/facebookresearch/fastText/blob/master/docs/crawl-vectors.md#tokenization
    {
        // match words;
        // words can have numbers (k8s, i18n, etc.) (is this a mistake?)
        regex: /(?:\p{L}[\p{L}'0-9-]*[\p{L}0-9])|\p{L}/giu,
        tag: "word",
    },
];

/**
 * Splits the input string using one TokenMatcher into a list of strings and tokens where:
 * - strings are the parts of the input that do not match the matcher (trimmed)
 * - tokens are the parts of the input that do match the matcher (@see Token)
 *
 * For example, if the matcher matches emojis:
 * > "hello world" -> ["hello world"]
 * > "😃" -> [{ ..."😃" }]
 * > "notemoji 😃 notemoji" -> ["notemoji", { ..."😃" }, "notemoji"]
 */
export const splitByToken = (input: string, matcher: TokenMatcher): (string | Token)[] => {
    const result: (string | Token)[] = [];

    const matches = input.match(matcher.regex);
    const remaining = input.split(matcher.regex);

    // interleave the matched and unmatched
    for (let i = 0; i < remaining.length; i++) {
        // unmatched string
        const unmatched = remaining[i].trim();
        if (unmatched.length > 0) result.push(unmatched);

        // matched token
        if (matches && i < matches.length) {
            result.push({
                text: matcher.transform ? matcher.transform(matches[i]) : matches[i],
                tag: matcher.tag,
            });
        }
    }

    return result;
};

/**
 * Tokenizes a string recursively.
 * It is assumed that all matchers with index `< matcherIndex` have already been
 * tried and failed to match, so we are clear to test for matchers `>= matcherIndex`.
 *
 * @param matcherIndex the index of the matcher to use in the Matchers array
 */
export const tokenizeStep = (input: string, matcherIndex: number): Token[] => {
    if (matcherIndex >= Matchers.length) {
        // no more matchers to try, mark as unknown
        return [{ text: input, tag: "unknown" }];
    }

    const result: Token[] = [];

    // split input by the matcher
    const list = splitByToken(input, Matchers[matcherIndex]);
    // now recursively tokenize with the remaining matchers
    // when the element is a string (aka unmatched)
    for (const elem of list) {
        if (typeof elem === "string") {
            // continue tokenizing
            result.push(...tokenizeStep(elem, matcherIndex + 1));
        } else {
            result.push(elem);
        }
    }

    return result;
};

/** Tokenizes a string into a list of tokens */
export const tokenize = (input: string): Token[] => tokenizeStep(input, 0);
