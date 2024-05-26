import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { IndexEntry } from "@pipeline/aggregate/Common";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface LanguageStats {
    languages: IndexEntry[];

    totalWords: number;
    uniqueWords: number;
    avgWordsPerMessage: number;
    wordsCount: number[];
}

const fn: BlockFn<LanguageStats> = (database, filters, common, args) => {
    let totalWithLang = 0;
    let totalWords = 0;
    const languagesCount = new Array(255).fill(0);
    const wordsCount = new Array(database.words.length).fill(0);
    const uniqueWords = new Set<number>();

    const processMessage = (msg: MessageView) => {
        if (msg.langIndex !== undefined) {
            totalWithLang++;
            languagesCount[msg.langIndex]++;
        }
        const words = msg.words;
        if (words) {
            for (const word of words) {
                wordsCount[word[0]] += word[1];
                totalWords += word[1];
                uniqueWords.add(word[0]);
            }
        }
    };

    filterMessages(processMessage, database, filters);

    // lang
    const langThreshold = Math.max(1, totalWithLang * 0.001); // at least 0.1% to be reliable
    const allLanguages = languagesCount.map((count, index) => ({ index, value: count }));
    const totalUnreliable = allLanguages
        .filter((lang) => lang.value < langThreshold)
        .reduce((sum, lang) => sum + lang.value, 0);
    const languageList = allLanguages.filter((lang) => lang.value >= langThreshold);
    try {
        languageList[0].value += totalUnreliable; // append cutoff languages to unreliable languages count
    } catch {
        // if the index didn't exist, push the value instead
        languageList.push({ index: 0, value: totalUnreliable });
    }
    languageList.sort((a, b) => b.value - a.value);

    return {
        languages: languageList,

        totalWords,
        uniqueWords: uniqueWords.size,
        avgWordsPerMessage: totalWords / totalWithLang,
        wordsCount,
    };
};

export default {
    key: "language/stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"language/stats", LanguageStats>;
