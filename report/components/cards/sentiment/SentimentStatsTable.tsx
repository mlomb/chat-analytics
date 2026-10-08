import { useBlockData } from "@report/BlockHook";
import SentimentPieChart from "@report/components/cards/sentiment/SentimentPieChart";
import DottedTable, { Line } from "@report/components/viz/DottedTable";

const SentimentStatsTable = () => {
    const sentimentStats = useBlockData("sentiment/stats");

    const lines: Line[] = [
        {
            type: "number",
            formatter: "integer",
            label: "Total messages",
            value: sentimentStats?.totalMessages,
        },
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
            tooltip: "Recognized sentiment terms balance to a zero score. This is different from having no score.",
        },
        {
            type: "number",
            formatter: "integer",
            label: "Not scored",
            value: sentimentStats?.unscoredMessages,
            tooltip: "No supported language or recognized sentiment terms. These messages are not labeled neutral.",
        },
        {
            type: "number",
            formatter: (n) => n.toLocaleString(undefined, { maximumFractionDigits: 1 }) + "%",
            label: "Sentiment coverage",
            value: sentimentStats
                ? sentimentStats.totalMessages > 0
                    ? ((sentimentStats.totalMessages - sentimentStats.unscoredMessages) /
                          sentimentStats.totalMessages) *
                      100
                    : 0
                : undefined,
        },
    ];

    return (
        <>
            <DottedTable lines={lines} />
            <p>
                Percentages include all messages in the current filters. Word scores describe wording, not intent:
                irony, friendly teasing and dialect may need conversation context.
            </p>
            <SentimentPieChart
                n={sentimentStats?.negativeMessages || 0}
                p={sentimentStats?.positiveMessages || 0}
                z={sentimentStats?.neutralMessages || 0}
                u={sentimentStats?.unscoredMessages || 0}
            />
        </>
    );
};

export default SentimentStatsTable;
