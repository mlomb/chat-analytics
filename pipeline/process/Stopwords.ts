import { progress } from "@pipeline/Progress";
import { downloadFile } from "@pipeline/File";
import { stripDiacritics } from "@pipeline/process/Diacritics";

// ISO 639-1 language code
type LangCode = string;

interface StopwordsData {
    [lang: LangCode]: string[];
}

export class Stopwords {
    private stopwords: { [lang: string]: Set<string> };

    constructor(data: StopwordsData) {
        this.stopwords = {};

        for (const lang in data) {
            this.stopwords[lang] = new Set(data[lang].map((word) => stripDiacritics(word.toLowerCase())));
        }
    }

    isStopword(lang: LangCode, word: string): boolean {
        if (lang in this.stopwords) return this.stopwords[lang].has(word);
        return false;
    }
}

export const loadStopwords = async (): Promise<Stopwords> => {
    progress.new("Downloading file", "stopwords-iso.json");
    const data = (await downloadFile(`stopwords-iso.json`, "json")) as StopwordsData;
    progress.done();
    return new Stopwords(data);
};
