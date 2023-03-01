import { useBlockData } from "@report/BlockHook";
import { getDatabase, getFormatCache } from "@report/WorkerWrapper";
import WordCloud from "@report/components/cards/language/WordCloud";
import WordStats from "@report/components/cards/language/WordStats";
import { WordLabel } from "@report/components/core/labels/WordLabel";
import MostUsed from "@report/components/viz/MostUsed";

import "@assets/styles/WordsCard.less";

const WordsIndexOf = (value: string) => getFormatCache().words.indexOf(value);
const WordsInFilter = (index: number, filter: string | RegExp) => {
    const word = getFormatCache().words[index];
    return filter instanceof RegExp ? filter.test(word) : word.startsWith(filter);
};

const WordsUsage = ({ options }: { options: number[] }) => {
    const languageStats = useBlockData("language/stats");

    if (options[0] === 1) return <WordCloud wordsCount={languageStats?.wordsCount} />;

    return (
        <div className="WordsCard">
            <MostUsed
                what="Word"
                unit="Times used"
                counts={languageStats?.wordsCount}
                maxItems={Math.min(15, getDatabase().words.length)}
                itemComponent={WordLabel}
                searchable
                allowRegex
                searchPlaceholder="Filter words..."
                indexOf={WordsIndexOf}
                inFilter={WordsInFilter}
            />

            <WordStats wordIndex={0} />
        </div>
    );
};

export default WordsUsage;
