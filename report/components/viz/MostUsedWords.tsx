import { useState } from "react";

import { searchFormat } from "@pipeline/Text";
import { LanguageStats } from "@pipeline/aggregate/blocks/LanguageStats";
import { useDataProvider } from "@report/DataProvider";
import AnimatedBars from "@report/components/viz/AnimatedBars";

const WordLabel = ({ index, pin }: { index: number; pin: boolean }) => {
    const dataProvider = useDataProvider();
    return (
        <>
            <span>{dataProvider.database.words[index]}</span>
            {pin && <span className="AnimatedBars__exact">EXACT</span>}
        </>
    );
};

const MostUsedWords = ({ data }: { data?: LanguageStats }) => {
    const dataProvider = useDataProvider();
    const [wordFilter, setWordFilter] = useState<string>("");

    const wordFilterSearchFormat = searchFormat(wordFilter);

    let exactIndex = -1;
    if (wordFilterSearchFormat.length > 0 && data !== undefined) {
        exactIndex = dataProvider.wordsSearchFormat.indexOf(wordFilterSearchFormat);
    }

    let arr = data
        ? data.wordsCount.map((c, i) => ({
              index: i,
              value: c,
              pin: exactIndex === i,
          }))
        : [];
    arr = arr.filter(
        (c) =>
            c.value > 0 &&
            // NOTE: startsWith or includes?
            (wordFilter.length === 0 ||
                c.pin ||
                dataProvider.wordsSearchFormat[c.index].startsWith(wordFilterSearchFormat))
    );
    arr.sort((a, b) => b.value - a.value);
    arr = arr.slice(0, 15);

    return (
        <div>
            <input type="text" value={wordFilter} onChange={(e) => setWordFilter(e.target.value)} />
            <AnimatedBars what="Word" unit="Times used" data={arr} itemComponent={WordLabel} maxItems={16} />
        </div>
    );
};

export default MostUsedWords;
