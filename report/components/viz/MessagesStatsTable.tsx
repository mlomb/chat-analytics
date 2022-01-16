import { AttachmentType } from "@pipeline/Types";
import { Day } from "@pipeline/Time";
import { MessagesStats } from "@pipeline/aggregate/blocks/MessagesStats";
import DottedTable, { Line } from "@report/components/viz/DottedTable";

const timeFormat = (day: Day, secondsOfDay: number): string => {
    return "a date";
};

const MessagesStatsTable = ({ data }: { data?: MessagesStats }) => {
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
            value: data ? data.timeWithoutMessages.minutes * 60 : undefined,
            tooltip: data
                ? `Longest inactivity period:\n${data.timeWithoutMessages.start}\nto\n${data.timeWithoutMessages.end}\n(rounded to 5 minutes)`
                : "",
        },
        {
            type: "number",
            formatter: "integer",
            label: "Dummy entry",
        },
    ];

    return (
        <div>
            <DottedTable lines={lines} />
        </div>
    );
};

export default MessagesStatsTable;
