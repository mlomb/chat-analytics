import { SentimentPerCycle } from "@pipeline/aggregate/blocks/SentimentPerCycle";
import DottedTable, { Line } from "@report/components/viz/DottedTable";
import { LanguageNames } from "@pipeline/Languages";

const SentimentStatsTable = ({ data }: { data?: SentimentPerCycle }) => {
    const lines: Line[] = [
        {
            type: "number",
            formatter: "integer",
            label: "Positive messages",
            value: data?.positiveMessages,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Negative messages",
            value: data?.negativeMessages,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Neutral messages",
            value: data?.neutralMessages,
        },
    ];

    return (
        <div>
            <DottedTable lines={lines} />
        </div>
    );
};

export default SentimentStatsTable;
