import { SentimentStats } from "@pipeline/aggregate/blocks/sentiment/SentimentStats";
import SentimentPieChart from "@report/components/cards/sentiment/SentimentPieChart";
import DottedTable, { Line } from "@report/components/viz/DottedTable";

const SentimentStatsTable = ({ data }: { data?: SentimentStats }) => {
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
        <>
            <DottedTable lines={lines} />
            <SentimentPieChart
                n={data?.negativeMessages || 0}
                p={data?.positiveMessages || 0}
                z={data?.neutralMessages || 0}
            />
        </>
    );
};

export default SentimentStatsTable;
