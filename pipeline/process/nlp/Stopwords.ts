import { Env } from "@pipeline/Env";
import { LanguageCodes } from "@pipeline/Languages";
import { matchFormat } from "@pipeline/process/nlp/Text";

interface StopwordsJSON {
    [lang: string]: string[];
}

/** Stopwords database */
export class Stopwords {
    private constructor(private readonly stopwords: StopwordsJSON) {
        // format all stopwords
        for (const lang in stopwords) {
            stopwords[lang] = stopwords[lang].map((word) => matchFormat(word));
        }
    }

    /** Checks wether a word is a stopword in any of the given languages */
    public isStopword(word: string, langs: (typeof LanguageCodes)[number][]): boolean {
        const wordFormatted = matchFormat(word);
        for (const lang of langs) {
            if (this.stopwords[lang] && this.stopwords[lang].includes(wordFormatted)) return true;
        }
        return false;
    }

    static async load(env: Env) {
        return new Stopwords(await env.loadAsset<StopwordsJSON>("/data/text/stopwords-iso.json", "json"));
    }
}
