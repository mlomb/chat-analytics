import { useState } from "react";

import { useBlockData } from "@report/BlockHook";
import { getDatabase, getFormatCache } from "@report/WorkerWrapper";
import { LoadingGroup } from "@report/components/LoadingGroup";
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
    const [selectedWord, setSelectedWord] = useState<number>(0);

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
                selectable={true}
                selectedIndex={selectedWord}
                onSelectChange={setSelectedWord}
            />

            <LoadingGroup>
                {(state) => (
                    <div className={"WordsCard__group " + (state !== "ready" ? "WordsCard__loading" : "")}>
                        <WordStats wordIndex={selectedWord} />
                        <div className="WordsCard__overlay" />
                    </div>
                )}
            </LoadingGroup>
        </div>
    );
};

export default WordsUsage;
