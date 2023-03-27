import { PlatformsInfo } from "@pipeline/Platforms";
import { useBlockData } from "@report/BlockHook";
import { getDatabase } from "@report/WorkerWrapper";
import DottedTable, { Line } from "@report/components/viz/DottedTable";

const EmojiStatsTable = () => {
    const emojiStats = useBlockData("emoji/stats");

    const db = getDatabase();
    const platformInfo = PlatformsInfo[db.config.platform];

    const reactionSupportTooltip = platformInfo.support.reactions
        ? undefined
        : platformInfo.name + " does not support reactions or the information is not present in export files";

    const lines: Line[] = [
        {
            type: "number",
            formatter: "integer",
            label: "Total emoji used in text",
            value: emojiStats ? emojiStats.inText.regular + emojiStats.inText.custom : 0,
        },
        {
            type: "number",
            formatter: "integer",
            depth: 1,
            label: "regular emoji (❤)",
            value: emojiStats?.inText.regular,
        },
        {
            type: "number",
            formatter: "integer",
            depth: 1,
            label: "custom emoji (:pepe:)",
            value: emojiStats?.inText.custom,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Unique emoji used in text",
            value: emojiStats?.inText.unique,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Messages with at least one emoji in text",
            value: emojiStats?.inText.messagesWithAtLeastOneEmoji,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Total emoji used in reactions",
            value: emojiStats ? emojiStats.inReactions.regular + emojiStats.inReactions.custom : 0,
            tooltip: reactionSupportTooltip,
        },
        /*
        {
            type: "number",
            formatter: "integer",
            depth: 1,
            label: "regular emoji (❤)",
            value: data?.inReactions.regular,
            tooltip: reactionSupportTooltip
        },
        {
            type: "number",
            formatter: "integer",
            depth: 1,
            label: "custom emoji (:pepe:)",
            value: data?.inReactions.custom,
            tooltip: reactionSupportTooltip
        },
        */
        {
            type: "number",
            formatter: "integer",
            label: "Unique emoji used in reactions",
            value: emojiStats?.inReactions.unique,
            tooltip: reactionSupportTooltip,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Messages with at least one emoji reacted",
            value: emojiStats?.inReactions.messagesWithAtLeastOneEmoji,
            tooltip: reactionSupportTooltip,
        },
    ];

    return <DottedTable lines={lines} />;
};

export default EmojiStatsTable;
