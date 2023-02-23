import { AttachmentType } from "@pipeline/Attachments";
import { PlatformsInfo } from "@pipeline/Platforms";
import { Day, formatTime } from "@pipeline/Time";
import type { Datetime } from "@pipeline/aggregate/Common";
import { useBlockData } from "@report/BlockHook";
import { getDatabase } from "@report/WorkerWrapper";
import DottedTable, { Line } from "@report/components/viz/DottedTable";

const MessagesStatsTable = () => {
    const stats = useBlockData("messages/stats");
    const duration = useBlockData("conversation-duration");

    const db = getDatabase();
    const platformInfo = PlatformsInfo[db.config.platform];

    const formatDatetime = (datetime?: Datetime) => {
        if (datetime === undefined) return "-";

        return formatTime("ymdhm", Day.fromKey(datetime.day), datetime.secondOfDay);
    };

    const lines: Line[] = [
        {
            type: "number",
            formatter: "integer",
            label: "Total messages sent",
            value: stats?.total,
        },
        {
            type: "number",
            formatter: "integer",
            label: "✏️ with text",
            depth: 1,
            value: stats?.withText,
        },
        {
            type: "number",
            formatter: "integer",
            label: "🔗 with links",
            depth: 1,
            value: stats?.withLinks,
        },
        {
            type: "number",
            formatter: "integer",
            label: "📷 with images",
            depth: 1,
            value: stats?.attachmentsCount[AttachmentType.Image],
        },
        {
            type: "number",
            formatter: "integer",
            label: "👾 with GIFs",
            depth: 1,
            value: stats?.attachmentsCount[AttachmentType.ImageAnimated],
        },
        {
            type: "number",
            formatter: "integer",
            label: "📹 with videos",
            depth: 1,
            value: stats?.attachmentsCount[AttachmentType.Video],
        },
        {
            type: "number",
            formatter: "integer",
            label: "🎉 with stickers",
            depth: 1,
            value: stats?.attachmentsCount[AttachmentType.Sticker],
            tooltip: platformInfo.support.stickers
                ? undefined
                : platformInfo.name + " does not support stickers or the information is not present in export files",
        },
        {
            type: "number",
            formatter: "integer",
            label: "🎵 with audio files",
            depth: 1,
            value: stats?.attachmentsCount[AttachmentType.Audio],
        },
        {
            type: "number",
            formatter: "integer",
            label: "📄 with documents",
            depth: 1,
            value: stats?.attachmentsCount[AttachmentType.Document],
        },
        {
            type: "number",
            formatter: "integer",
            label: "📁 with other files",
            depth: 1,
            value: stats?.attachmentsCount[AttachmentType.Other],
        },
        {
            type: "number",
            formatter: "decimal",
            label: "Average messages per day",
            value: stats ? stats.total / stats.numActiveDays : undefined,
        },
        {
            type: "number",
            formatter: "time",
            label: "Longest period without messages",
            value:
                duration && duration.longestTimeWithoutMessages
                    ? duration.longestTimeWithoutMessages.minutes * 60
                    : undefined,
            tooltip: (
                <>
                    Longest inactivity period:
                    <br />
                    <b>
                        from {formatDatetime(duration?.longestTimeWithoutMessages?.start)}
                        <br />
                        to {formatDatetime(duration?.longestTimeWithoutMessages?.end)}
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
            value:
                duration && duration.longestActiveConversation
                    ? duration.longestActiveConversation.minutes * 60
                    : undefined,
            tooltip: (
                <>
                    Longest active conversation:
                    <br />
                    <b>
                        from {formatDatetime(duration?.longestActiveConversation?.start)}
                        <br />
                        to {formatDatetime(duration?.longestActiveConversation?.end)}
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
            value: stats?.mostActive.year.text,
            tooltip: <>with {stats?.mostActive.year.messages.toLocaleString()} messages</>,
        },
        {
            type: "text",
            label: "month ever",
            depth: 1,
            value: stats?.mostActive.month.text,
            tooltip: <>with {stats?.mostActive.month.messages.toLocaleString()} messages</>,
        },
        {
            type: "text",
            label: "day ever",
            depth: 1,
            value: stats?.mostActive.day.text,
            tooltip: <>with {stats?.mostActive.day.messages.toLocaleString()} messages</>,
        },
        {
            type: "text",
            label: "hour ever",
            depth: 1,
            value: stats?.mostActive.hour.text,
            tooltip: <>with {stats?.mostActive.hour.messages.toLocaleString()} messages</>,
        },
    ];

    return <DottedTable lines={lines} />;
};

export default MessagesStatsTable;
