import { AttachmentType } from "@pipeline/Types";
import { MessagesStats } from "@pipeline/aggregate/blocks/MessagesStats";
import DottedTable, { Line } from "@report/components/viz/DottedTable";
import { useDataProvider } from "@report/DataProvider";

const MessagesStatsTable = ({ data }: { data?: MessagesStats }) => {
    const dataProvider = useDataProvider();

    const lines: Line[] = [
        {
            type: "number",
            formatter: "integer",
            label: "Total messages sent",
            value: data?.total,
        },
        {
            type: "number",
            formatter: "integer",
            label: "✏️ with text",
            depth: 1,
            value: data?.withText,
        },
        {
            type: "number",
            formatter: "integer",
            label: "🔗 with links",
            depth: 1,
            value: data?.withLinks,
        },
        {
            type: "number",
            formatter: "integer",
            label: "📷 with images",
            depth: 1,
            value: data?.attachmentsCount[AttachmentType.Image],
        },
        {
            type: "number",
            formatter: "integer",
            label: "👾 with GIFs",
            depth: 1,
            value: data?.attachmentsCount[AttachmentType.ImageAnimated],
        },
        {
            type: "number",
            formatter: "integer",
            label: "📹 with videos",
            depth: 1,
            value: data?.attachmentsCount[AttachmentType.Video],
        },
        {
            type: "number",
            formatter: "integer",
            label: "🎉 with stickers",
            depth: 1,
            value: data?.attachmentsCount[AttachmentType.Sticker],
            tooltip:
                dataProvider.database.config.platform === "discord"
                    ? "Discord exports do not include stickers for now."
                    : undefined,
        },
        {
            type: "number",
            formatter: "integer",
            label: "🎵 with audio files",
            depth: 1,
            value: data?.attachmentsCount[AttachmentType.Audio],
        },
        {
            type: "number",
            formatter: "integer",
            label: "📄 with documents",
            depth: 1,
            value: data?.attachmentsCount[AttachmentType.Document],
        },
        {
            type: "number",
            formatter: "integer",
            label: "📁 with other files",
            depth: 1,
            value: data?.attachmentsCount[AttachmentType.Other],
        },
        {
            type: "number",
            formatter: "decimal",
            label: "Average messages per day",
            value: data ? data.total / data.numActiveDays : undefined,
        },
        {
            type: "number",
            formatter: "time",
            label: "Longest period without messages",
            value: data ? data.longestTimeWithoutMessages.minutes * 60 : undefined,
            tooltip: (
                <>
                    Longest inactivity period:
                    <br />
                    <b>
                        from {data?.longestTimeWithoutMessages.start}
                        <br />
                        to {data?.longestTimeWithoutMessages.end}
                    </b>
                    <br />
                    (rounded to 5 minutes)
                </>
            ),
        },
        {
            type: "number",
            formatter: "time",
            label: "Longest active conversation",
            value: data ? data.longestActiveConversation.minutes * 60 : undefined,
            tooltip: (
                <>
                    Longest active conversation:
                    <br />
                    <b>
                        from {data?.longestActiveConversation.start}
                        <br />
                        to {data?.longestActiveConversation.end}
                    </b>
                    <br />
                    (rounded to 5 minutes)
                    <br />
                    <br />
                    <b>❓ Active conversation:</b> considered still active if the time between the previous and next
                    message is less than 10 minutes. Makes more sense when filtering by a single channel.
                </>
            ),
        },
    ];

    return (
        <div>
            <DottedTable lines={lines} />
        </div>
    );
};

export default MessagesStatsTable;