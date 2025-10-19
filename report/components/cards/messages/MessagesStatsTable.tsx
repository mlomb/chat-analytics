import { AttachmentType } from "@pipeline/Attachments";
import { PlatformsInfo } from "@pipeline/Platforms";
import { formatDatetime } from "@pipeline/Time";
import { useBlockData } from "@report/BlockHook";
import { getDatabase } from "@report/WorkerWrapper";
import DottedTable, { Line } from "@report/components/viz/DottedTable";

import { MessagesStats } from "../../../../chat_analytics/bindings/MessagesStats";

const MessagesStatsTable = () => {
    const stats: MessagesStats | undefined = useBlockData("messages/stats");
    const duration = useBlockData("interaction/conversation-duration");

    const db = getDatabase();
    const platformInfo = PlatformsInfo[db.config.platform];

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
            value: stats?.withAttachmentsCount[AttachmentType.Image],
        },
        {
            type: "number",
            formatter: "integer",
            label: "👾 with GIFs",
            depth: 1,
            value: stats?.withAttachmentsCount[AttachmentType.ImageAnimated],
        },
        {
            type: "number",
            formatter: "integer",
            label: "📹 with videos",
            depth: 1,
            value: stats?.withAttachmentsCount[AttachmentType.Video],
        },
        {
            type: "number",
            formatter: "integer",
            label: "🎉 with stickers",
            depth: 1,
            value: stats?.withAttachmentsCount[AttachmentType.Sticker],
            tooltip: platformInfo.support.stickers
                ? undefined
                : platformInfo.name + " does not support stickers or the information is not present in export files",
        },
        {
            type: "number",
            formatter: "integer",
            label: "🎵 with audio files",
            depth: 1,
            value: stats?.withAttachmentsCount[AttachmentType.Audio],
        },
        {
            type: "number",
            formatter: "integer",
            label: "📄 with documents",
            depth: 1,
            value: stats?.withAttachmentsCount[AttachmentType.Document],
        },
        {
            type: "number",
            formatter: "integer",
            label: "📁 with other files",
            depth: 1,
            value: stats?.withAttachmentsCount[AttachmentType.Other],
        },
        {
            type: "number",
            formatter: "integer",
            label: "Edited messages",
            value: stats?.edited,
            tooltip: (
                <>
                    <b>{stats ? ((stats.edited / stats.total) * 100).toFixed(2) : "-"}%</b> of total messages were
                    edited
                </>
            ),
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
                        from {formatDatetime("ymdhm", duration?.longestTimeWithoutMessages?.start)}
                        <br />
                        to {formatDatetime("ymdhm", duration?.longestTimeWithoutMessages?.end)}
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
                        from {formatDatetime("ymdhm", duration?.longestActiveConversation?.start)}
                        <br />
                        to {formatDatetime("ymdhm", duration?.longestActiveConversation?.end)}
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
            value: formatDatetime("y", stats?.mostActiveYear?.index),
            tooltip: <>with {stats?.mostActiveYear?.messages.toLocaleString()} messages</>,
        },
        {
            type: "text",
            label: "month ever",
            depth: 1,
            value: formatDatetime("ym", stats?.mostActiveMonth?.index),
            tooltip: <>with {stats?.mostActiveMonth?.messages.toLocaleString()} messages</>,
        },
        {
            type: "text",
            label: "day ever",
            depth: 1,
            value: formatDatetime("ymd", stats?.mostActiveDay?.index),
            tooltip: <>with {stats?.mostActiveDay?.messages.toLocaleString()} messages</>,
        },
        {
            type: "text",
            label: "hour ever",
            depth: 1,
            value: formatDatetime("ymdh", stats?.mostActiveHour?.index),
            tooltip: <>with {stats?.mostActiveHour?.messages.toLocaleString()} messages</>,
        },
    ];

    return <DottedTable lines={lines} />;
};

export default MessagesStatsTable;
