import { AttachmentType } from "@pipeline/Attachments";
import { PlatformsInfo } from "@pipeline/Platforms";
import { MessagesStats } from "@pipeline/aggregate/blocks/MessagesStats";
import { getDatabase } from "@report/WorkerWrapper";
import DottedTable, { Line } from "@report/components/viz/DottedTable";

const MessagesStatsTable = ({ data }: { data?: MessagesStats }) => {
    const db = getDatabase();
    const platformInfo = PlatformsInfo[db.config.platform];

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
            tooltip: platformInfo.support.stickers
                ? undefined
                : platformInfo.name + " does not support stickers or the information is not present in export files",
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
        {
            type: "separator",
        },
        {
            type: "title",
            label: "Most active...",
        },
        {
            type: "text",
            label: "year ever",
            depth: 1,
            value: data?.mostActive.year.text,
            tooltip: <>with {data?.mostActive.year.messages.toLocaleString()} messages</>,
        },
        {
            type: "text",
            label: "month ever",
            depth: 1,
            value: data?.mostActive.month.text,
            tooltip: <>with {data?.mostActive.month.messages.toLocaleString()} messages</>,
        },
        {
            type: "text",
            label: "day ever",
            depth: 1,
            value: data?.mostActive.day.text,
            tooltip: <>with {data?.mostActive.day.messages.toLocaleString()} messages</>,
        },
        {
            type: "text",
            label: "hour ever",
            depth: 1,
            value: data?.mostActive.hour.text,
            tooltip: <>with {data?.mostActive.hour.messages.toLocaleString()} messages</>,
        },
    ];

    return <DottedTable lines={lines} />;
};

export default MessagesStatsTable;
