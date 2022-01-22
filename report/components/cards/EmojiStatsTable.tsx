import { EmojiStats } from "@pipeline/aggregate/blocks/EmojiStats";
import DottedTable, { Line } from "@report/components/viz/DottedTable";

const MessagesStatsTable = ({ data }: { data?: EmojiStats }) => {
    const lines: Line[] = [
        {
            type: "number",
            formatter: "integer",
            label: "Total emojis used in text",
            value: data ? data.inText.regular + data.inText.custom : 0,
        },
        {
            type: "number",
            formatter: "integer",
            depth: 1,
            label: "regular emojis (❤)",
            value: data?.inText.regular,
        },
        {
            type: "number",
            formatter: "integer",
            depth: 1,
            label: "custom emojis (:pepe:)",
            value: data?.inText.custom,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Unique emojis used in text",
            value: data?.inText.unique,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Messages with at least one emoji in text",
            value: data?.inText.oncePerMessage,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Total emojis used in reactions",
            value: data ? data.inReactions.regular + data.inReactions.custom : 0,
        },
        {
            type: "number",
            formatter: "integer",
            depth: 1,
            label: "regular emojis (❤)",
            value: data?.inReactions.regular,
        },
        {
            type: "number",
            formatter: "integer",
            depth: 1,
            label: "custom emojis (:pepe:)",
            value: data?.inReactions.custom,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Unique emojis used in reactions",
            value: data?.inReactions.unique,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Messages with at least one emoji reacted",
            value: data?.inReactions.oncePerMessage,
        },
    ];

    return (
        <div>
            <DottedTable lines={lines} />
        </div>
    );
};

export default MessagesStatsTable;
