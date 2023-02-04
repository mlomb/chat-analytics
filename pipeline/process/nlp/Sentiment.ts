import { unzipSync } from "fflate";

import { Env } from "@pipeline/Env";
import { Language, LanguageCodes } from "@pipeline/Languages";
import { Progress } from "@pipeline/Progress";
import { Index } from "@pipeline/Types";
import { Emojis } from "@pipeline/process/nlp/Emojis";
import { normalizeText } from "@pipeline/process/nlp/Text";
import { Token, tokenize } from "@pipeline/process/nlp/Tokenizer";

// TODO: This class has to be refactored and tested, but since we probably will change a bit
// the way we handle sentiment, I will leave it as it is for now.
export class Sentiment {
    private readonly langs: {
        [lang: Index]: {
            negators: PatternMatcher;
            afinn: PatternMatcher;
        };
    } = {};

    private constructor(afinnZipBuffer: ArrayBuffer, private emojiData: Emojis, progress?: Progress) {
        const filesAsBuffers = unzipSync(new Uint8Array(afinnZipBuffer));
        const filesAsStrings: { [key: string]: string } = {};

        // transform buffers into strings
        for (const filename in filesAsBuffers) {
            filesAsStrings[filename] = new TextDecoder("utf-8").decode(filesAsBuffers[filename]);
        }

        // read all-negators.json
        const negators = JSON.parse(filesAsStrings["all-negators.json"]) as { [lang: string]: string[] };

        progress?.new("Preparing sentiment database");
        const total = Object.keys(filesAsStrings).length;
        let processed = 0;
        for (const filename in filesAsStrings) {
            if (filename.startsWith("AFINN-")) {
                const lang = filename.substring(6, filename.length - 5) as Language;
                const langIndex = LanguageCodes.indexOf(lang);
                if (langIndex === -1) {
                    // TODO: fixme
                    // console.log("Skipping language", lang);
                    continue;
                }

                const langNegators = negators[lang];
                const langAfinn = JSON.parse(filesAsStrings[filename]) as { [word: string]: number };

                this.langs[langIndex] = {
                    negators: new PatternMatcher(langNegators),
                    afinn: new PatternMatcher(Object.keys(langAfinn), Object.values(langAfinn)),
                };
            }
            progress?.progress("number", processed++, total);
        }
        progress?.success();
    }

    // NOTE: based on marcellobarile/multilang-sentiment
    calculate(tokens: Token[], lang: Index): number | undefined {
        const langDb = this.langs[lang];
        if (langDb === undefined) return undefined;

        // TODO: RTL

        let score = 0;
        let nearNegator = false;
        let nearNegatorDist = 0;

        for (let i = 0, len = tokens.length; i < len; i++) {
            const token = tokens[i];

            // non-words reset the negator
            // also if we are too far
            if (token.tag !== "word" || nearNegatorDist > 5) nearNegator = false;
            nearNegatorDist++;

            if (token.tag === "emoji") {
                score += this.emojiData.getSentiment(token.text);
                continue;
            }

            // only handle words
            if (token.tag == "word") {
                const slice = tokens.slice(i);

                const negatorMatch = langDb.negators.match(slice);
                if (negatorMatch) {
                    nearNegator = true;
                    nearNegatorDist = 0;
                    continue;
                }

                const afinnMatch = langDb.afinn.match(slice);
                if (afinnMatch) {
                    score += afinnMatch.value * (nearNegator ? -1 : 1);
                }
            }
        }

        return score;
    }

    static async load(env: Env, emojis: Emojis) {
        const afinnZipBuffer = await env.loadAsset("/data/text/AFINN.zip", "arraybuffer");
        return new Sentiment(afinnZipBuffer, emojis, env.progress);
    }
}

interface PatternEntry {
    value: number;
    pattern: string[];
}

// TODO: fuzzing?
class PatternMatcher {
    private readonly mapping: Map<string, PatternEntry[]>;

    constructor(patterns: string[], values?: number[]) {
        if (values) console.assert(patterns.length === values.length);
        const len = patterns.length;

        // normalize patterns
        patterns = patterns.map((pattern) => normalizeText(pattern).toLowerCase());
        // tokenize patterns
        const patternsTokenized = patterns
            .map((pattern) => tokenize(pattern))
            .map((tokens) =>
                tokens.filter((token) => token.tag === "word" || token.tag === "emoji").map((token) => token.text)
            );

        // map patterns
        this.mapping = new Map();
        for (let i = 0; i < len; i++) {
            const pattern = patternsTokenized[i];
            if (pattern.length === 0) continue;
            const entry = { value: values ? values[i] : 1, pattern: pattern.slice(1) };
            if (this.mapping.has(pattern[0])) {
                this.mapping.get(pattern[0])!.push(entry);
            } else {
                this.mapping.set(pattern[0], [entry]);
            }
        }

        // sort patterns by specificity
        for (const key of this.mapping.keys()) {
            const group = this.mapping.get(key);
            group?.sort((a, b) => b.pattern.length - a.pattern.length);
        }
    }

    match(input: Token[]): PatternEntry | undefined {
        if (input.length === 0) return undefined;

        const group = this.mapping.get(input[0].text);
        if (group === undefined) return undefined;

        for (const entry of group) {
            const len = entry.pattern.length;
            if (input.length - 1 < len) continue;
            let i = 0;
            while (i < len && input[i + 1].tag === "word" && input[i + 1].text.toLowerCase() === entry.pattern[i]) i++;
            if (i === len) return entry;
        }

        return undefined;
    }
}
