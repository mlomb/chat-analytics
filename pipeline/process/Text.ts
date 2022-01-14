import { progress } from "@pipeline/Progress";
import { downloadFile } from "@pipeline/File";
import { FastTextModel, loadFastTextModel } from "@pipeline/process/FastTextModel";

export const loadTextData = async () => {
    // load diacritics
    {
        progress.new("Downloading file", "diacritics.json");
        type DiacriticsJSON = {
            base: string;
            letters: string;
        }[];
        const data = (await downloadFile("data/diacritics.json", "json")) as DiacriticsJSON;
        diacriticsRegex = new RegExp("[" + data.map((d) => d.letters).join("") + "]", "g");
        diacriticsReplacement = {};
        for (const entry of data) {
            for (const letter of entry.letters) {
                diacriticsReplacement[normalizeText(letter)] = entry.base;
            }
        }
        progress.done();
    }

    // load stopwords
    {
        progress.new("Downloading file", "stopwords-iso.json");
        interface StopwordsJSON {
            [lang: string]: string[];
        }
        const data = (await downloadFile("data/stopwords-iso.json", "json")) as StopwordsJSON;

        // combining all stopwords is a mistake?
        stopwords = new Set(
            Object.values(data)
                .reduce((acc, val) => acc.concat(val), [])
                .map((word) => stripDiacritics(normalizeText(word)))
        );
        progress.done();
    }

    // load language detector model
    langPredictModel = await loadFastTextModel("lid.176");
};

let stopwords: Set<string>;
let diacriticsRegex: RegExp;
let diacriticsReplacement: { [key: string]: string };
let langPredictModel: FastTextModel;

export const normalizeText = (text: string) =>
    text
        // normalize the content using NFC (we want the compositions)
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
        .normalize("NFC")
        // change all whitespace to one space (important for the lang detector, newlines bad)
        .replace(/\s\s+/g, " ")
        // trim
        .trim();

export const stripDiacritics = (text: string) => text.replace(diacriticsRegex, (match) => diacriticsReplacement[match]);

// NOTE: assumes the word is normalized
export const isStopword = (word: string) => stopwords.has(word);

const LABEL_PREFIX_LENGTH = "__label__".length;
// NOTE: assumes the word is normalized and contains no newlines
export const detectLanguageLine = async (line: string) => {
    const result = langPredictModel.predict(line, 1, 0.0);
    return result[0][1].slice(LABEL_PREFIX_LENGTH);
};
