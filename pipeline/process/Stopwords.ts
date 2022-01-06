import { progress } from "@pipeline/Progress";
import { downloadTextFile } from "@pipeline/File";
import { stripDiacritics } from "@pipeline/process/Diacritics";

// ISO 639-1 language code
type LangCode = string;

interface StopwordsData {
    [lang: LangCode]: string[];
}

export class Stopwords {
    constructor(private readonly data: StopwordsData) {
        for (const lang in data) {
            data[lang] = data[lang].map((word) => stripDiacritics(word.toLowerCase()));
        }
    }

    isStopword(lang: LangCode, word: string): boolean {
        if (!this.data[lang]) return false;
        return this.data[lang].includes(word);
    }
}

export const loadStopwords = async (): Promise<Stopwords> => {
    progress.new("Downloading file", "stopwords-iso.json");
    const data = JSON.parse(await downloadTextFile(`stopwords-iso.json`)) as StopwordsData;
    progress.done();
    return new Stopwords(data);
};
