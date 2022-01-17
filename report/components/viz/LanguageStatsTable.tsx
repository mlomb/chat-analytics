import { AttachmentType } from "@pipeline/Types";
import { Day } from "@pipeline/Time";
import { LanguageStats } from "@pipeline/aggregate/blocks/LanguageStats";
import DottedTable, { Line } from "@report/components/viz/DottedTable";
import { useDataProvider } from "@report/DataProvider";
import { LanguageNames } from "@pipeline/Languages";

const LanguageStatsTable = ({ data }: { data?: LanguageStats }) => {
    const dataProvider = useDataProvider();

    const lines: Line[] = [
        {
            type: "number",
            formatter: "integer",
            label: "Languages used",
            value: 0,
        },
        ...(data?.languages.map(
            (language) =>
                ({
                    type: "number",
                    formatter: "integer",
                    label: LanguageNames[language.index],
                    value: language.value,
                    depth: 1,
                } as Line)
        ) ?? []),
    ];

    console.log(data);

    return (
        <div>
            <DottedTable lines={lines} />
        </div>
    );
};

export default LanguageStatsTable;
