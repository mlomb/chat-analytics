import { LanguageNames } from "@pipeline/Languages";
import { useBlockData } from "@report/BlockHook";
import DottedTable, { Line } from "@report/components/viz/DottedTable";

const LanguageStatsTable = () => {
    const languageStats = useBlockData("language/stats");

    const lines: Line[] = [
        {
            type: "number",
            formatter: "integer",
            label: "Total words used",
            value: languageStats?.totalWords,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Unique words used",
            value: languageStats?.uniqueWords,
        },
        {
            type: "number",
            formatter: "decimal",
            label: "Average words per message",
            value: languageStats?.avgWordsPerMessage,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Languages used",
            value: languageStats ? languageStats.languages.reduce((acc, lang) => acc + +(lang.index > 0), 0) : 0,
        },
        ...(languageStats?.languages.map(
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
