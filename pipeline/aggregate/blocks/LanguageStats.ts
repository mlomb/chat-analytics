import { Index } from "@pipeline/Types";
import { BlockDescription, BlockFn, IndexEntry } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface LanguageStats {
    languages: IndexEntry[];

    totalWords: number;
    uniqueWords: number;
    avgWordsPerMessage: number;
    wordsCount: number[];
}

const fn: BlockFn<LanguageStats> = (database, filters, common) => {
    let totalWithLang = 0;
    let totalWords = 0;
    const languagesCount = new Array(255).fill(0);
    const wordsCount = new Array(database.words.length).fill(0);
    const uniqueWords = new Set<number>();

    const processMessage = (msg: MessageView, channelIndex: Index) => {
        if (msg.langIndex !== undefined) {
            totalWithLang++;
            languagesCount[msg.langIndex]++;
        }
        const words = msg.getWords();
        if (words) {
            for (const word of words) {
                wordsCount[word[0]] += word[1];
                totalWords += word[1];
                uniqueWords.add(word[0]);
            }
        }
    };

    parseAndFilterMessages(processMessage, database, filters);

    // lang
    const langThreshold = Math.max(1, totalWithLang * 0.03); // at least 3% to be reliable
    const allLanguages = languagesCount.map((count, index) => ({ index, value: count }));
    const totalUnreliable = allLanguages
        .filter((lang) => lang.value < langThreshold)
        .reduce((sum, lang) => sum + lang.value, 0);
    const languageList = allLanguages.filter((lang) => lang.value >= langThreshold);
    languageList.push({ index: 0, value: totalUnreliable });
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
    key: "language-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"language-stats", LanguageStats>;
