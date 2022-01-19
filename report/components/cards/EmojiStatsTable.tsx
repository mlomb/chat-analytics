import { EmojiStats } from "@pipeline/aggregate/blocks/EmojiStats";
import DottedTable, { Line } from "@report/components/viz/DottedTable";

const MessagesStatsTable = ({ data }: { data?: EmojiStats }) => {
    const lines: Line[] = [
        {
            type: "number",
            formatter: "integer",
            label: "Total emojis used",
            value: data?.totalEmojis,
        },
        {
            type: "number",
            formatter: "integer",
            depth: 1,
            label: "regular emojis (❤)",
            value: data ? data.totalEmojis - data.totalCustomEmojis : 0,
        },
        {
            type: "number",
            formatter: "integer",
            depth: 1,
            label: "custom emojis (:pepe:)",
            value: data?.totalCustomEmojis,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Unique emojis used",
            value: data?.uniqueEmojis,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Messages with at least one emoji",
            value: data?.messagesWithAtLeastOneEmoji,
        },
    ];

    return (
        <div>
            <DottedTable lines={lines} />
        </div>
    );
};

export default MessagesStatsTable;
