import { useBlockData } from "@report/BlockHook";
import SentimentPieChart from "@report/components/cards/sentiment/SentimentPieChart";
import DottedTable, { Line } from "@report/components/viz/DottedTable";

const SentimentStatsTable = () => {
    const sentimentStats = useBlockData("sentiment-stats");

    const lines: Line[] = [
        {
            type: "number",
            formatter: "integer",
            label: "Positive messages",
            value: sentimentStats?.positiveMessages,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Negative messages",
            value: sentimentStats?.negativeMessages,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Neutral messages",
            value: sentimentStats?.neutralMessages,
        },
    ];

    return (
        <>
            <DottedTable lines={lines} />
            <SentimentPieChart
                n={sentimentStats?.negativeMessages || 0}
                p={sentimentStats?.positiveMessages || 0}
                z={sentimentStats?.neutralMessages || 0}
            />
        </>
    );
};

export default SentimentStatsTable;
