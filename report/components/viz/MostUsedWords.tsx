import { useState } from "react";
import { AttachmentType } from "@pipeline/Types";
import { Day } from "@pipeline/Time";
import { LanguageStats } from "@pipeline/aggregate/blocks/LanguageStats";
import DottedTable, { Line } from "@report/components/viz/DottedTable";
import { useDataProvider } from "@report/DataProvider";
import { LanguageNames } from "@pipeline/Languages";
import AnimatedBars from "@report/components/viz/AnimatedBars";
import { searchFormat } from "@pipeline/Text";

const WordLabel = ({ index }: { index: number }) => {
    const dataProvider = useDataProvider();
    return <div>{dataProvider.database.words[index]}</div>;
};

const MostUsedWords = ({ data }: { data?: LanguageStats }) => {
    const dataProvider = useDataProvider();
    const [wordFilter, setWordFilter] = useState<string>("");
    console.log(data);

    const wordFilterSearchFormat = searchFormat(wordFilter);
    const arr = data?.wordsCount
        .map((c, i) => ({
            index: i,
            value: c,
        }))
        .filter(
            (c) =>
                c.value > 0 &&
                (wordFilter.length === 0 || dataProvider.wordsSearchFormat[c.index].includes(wordFilterSearchFormat))
        )
        .slice(0, 15);

    return (
        <div>
            <input type="text" value={wordFilter} onChange={(e) => setWordFilter(e.target.value)} />
            <AnimatedBars
                what="Word"
                unit="Times used"
                data={arr || []}
                itemComponent={WordLabel}
                maxItems={16}
                colorHue={340}
            />
        </div>
    );
};

export default MostUsedWords;
