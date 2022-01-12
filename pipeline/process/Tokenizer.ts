import emojiRegex from "emoji-regex";

export type Tag = "code" | "url" | "mention" | "emoji" | "custom-emoji" | "word" | "unknown";

export interface Token {
    text: string;
    tag: Tag;
}

interface Matcher {
    regex: RegExp;
    tag: Tag;
}

// order is critical
const Matchers: Matcher[] = [
    {
        // should we handle it this way?
        // source code, ascii art, some other stuff should not be included
        regex: /```[^`]*```/g,
        tag: "code",
    },
    {
        // match URLs
        // TODO: find a better regex, @dperini version (not this one ↓) is probably too restrictive for us
        regex: /(?:https?:\/\/)(?:[\da-z\.-]+)\.(?:[a-z\.]{2,6})(?:[\/\w\.\-\?#=]*)*\/?/gi,
        tag: "url",
    },
    {
        // match @mentions
        regex: /@[\p{L}_0-9]+/giu,
        tag: "mention",
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
    },
    // TODO: match words on languages that words are one character (help wanted)
    {
        // match words
        // words can have numbers (k8s, i18n, etc) (is this a mistake?)
        regex: /(?:\p{L}[\p{L}'0-9-]*[\p{L}0-9])|\p{L}/giu,
        tag: "word",
    },
];

// match against one matcher
// result: [ "not matched", { ...token }, "not matched", ... ]
const matchOne = (input: string, matcher: Matcher): (string | Token)[] => {
    const matches = input.match(matcher.regex);
    if (matches === null || matches.length === 0) return [input];
    const remaining = input.split(matcher.regex);

    const result: (string | Token)[] = [];
    for (let i = 0; i < remaining.length; i++) {
        const s = remaining[i].trim();
        if (s.length > 0) result.push(s);
        if (i < matches.length) result.push({ text: matches[i], tag: matcher.tag });
    }
    return result;
};

const tokenizeStep = (input: string, step: number): Token[] => {
    if (step >= Matchers.length) {
        // TODO: something else?
        return [{ text: input, tag: "unknown" }];
    }

    const result: Token[] = [];
    const list = matchOne(input, Matchers[step]);
    for (let i = 0; i < list.length; i++) {
        const t = list[i];
        if (typeof t === "string") {
            // continue tokenizing
            result.push(...tokenizeStep(t, step + 1));
        } else {
            result.push(t);
        }
    }
    return result;
};

export const tokenize = (input: string): Token[] => tokenizeStep(input, 0);
