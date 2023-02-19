import { LanguageNames } from "@pipeline/Languages";
import { LanguageStats } from "@pipeline/aggregate/blocks/language/LanguageStats";
import DottedTable, { Line } from "@report/components/viz/DottedTable";

const LanguageStatsTable = ({ data }: { data?: LanguageStats }) => {
    const lines: Line[] = [
        {
            type: "number",
            formatter: "integer",
            label: "Total words used",
            value: data?.totalWords,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Unique words used",
            value: data?.uniqueWords,
        },
        {
            type: "number",
            formatter: "decimal",
            label: "Average words per message",
            value: data?.avgWordsPerMessage,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Languages used",
            value: data ? data.languages.reduce((acc, lang) => acc + +(lang.index > 0), 0) : 0,
        },
        ...(data?.languages.map(
            (language) =>
                ({
                    type: "number",
                    formatter: "integer",
                    label: LanguageNames[language.index],
                    value: language.value,
                    depth: 1,
                    tooltip:
                        language.index === 0
                            ? "Messages that did not have enough text to reliable detect the language"
                            : undefined,
                } as Line)
        ) ?? []),
    ];

    return <DottedTable lines={lines} />;
};

export default LanguageStatsTable;
