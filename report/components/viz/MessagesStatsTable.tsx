import DottedTable, { Line } from "@report/components/viz/DottedTable";
import { MessagesStats } from "@pipeline/aggregate/blocks/MessagesStats";
import { AttachmentType } from "@pipeline/Types";

const MessagesStatsTable = ({ data }: { data?: MessagesStats }) => {
    const lines: Line[] = [
        {
            type: "number",
            label: "Total messages sent",
            value: data?.total,
        },
        {
            type: "number",
            label: "✏️ with text",
            depth: 1,
            value: data?.withText,
        },
        {
            type: "number",
            label: "🔗 with links",
            depth: 1,
            value: data?.withLinks,
        },
        {
            type: "number",
            label: "📷 with images",
            depth: 1,
            value: data?.attachmentsCount[AttachmentType.Image],
        },
        {
            type: "number",
            label: "👾 with GIFs",
            depth: 1,
            value: data?.attachmentsCount[AttachmentType.ImageAnimated],
        },
        {
            type: "number",
            label: "📹 with videos",
            depth: 1,
            value: data?.attachmentsCount[AttachmentType.Video],
        },
        {
            type: "number",
            label: "🎉 with stickers",
            depth: 1,
            value: data?.attachmentsCount[AttachmentType.Sticker],
        },
        {
            type: "number",
            label: "🎵 with audios",
            depth: 1,
            value: data?.attachmentsCount[AttachmentType.Audio],
        },
        {
            type: "number",
            label: "📄 with documents",
            depth: 1,
            value: data?.attachmentsCount[AttachmentType.Document],
        },
        {
            type: "number",
            label: "📁 with other files",
            depth: 1,
            value: data?.attachmentsCount[AttachmentType.Other],
        },
        {
            type: "number",
            label: "Average messages per day",
            value: data ? data.total / data.numActiveDays : undefined,
            decimals: 2,
        },
        {
            type: "timediff",
            label: "Longest period without messages",
            hours: undefined,
        },
    ];

    return (
        <div>
            <DottedTable lines={lines} />
            {JSON.stringify(data?.attachmentsCount)}
        </div>
    );
};

export default MessagesStatsTable;
