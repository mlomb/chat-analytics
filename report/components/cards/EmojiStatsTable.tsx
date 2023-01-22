import { PlatformsInfo } from "@pipeline/Platforms";
import { EmojiStats } from "@pipeline/aggregate/blocks/EmojiStats";
import { useDataProvider } from "@report/DataProvider";
import DottedTable, { Line } from "@report/components/viz/DottedTable";

const MessagesStatsTable = ({ data }: { data?: EmojiStats }) => {
    const dataProvider = useDataProvider();
    const platformInfo = PlatformsInfo[dataProvider.database.config.platform];

    const reactionSupportTooltip = platformInfo.support.reactions
        ? undefined
        : platformInfo.name + " does not support reactions or the information is not present in export files";

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
            tooltip: reactionSupportTooltip,
        },
        /*
        {
            type: "number",
            formatter: "integer",
            depth: 1,
            label: "regular emojis (❤)",
            value: data?.inReactions.regular,
            tooltip: reactionSupportTooltip
        },
        {
            type: "number",
            formatter: "integer",
            depth: 1,
            label: "custom emojis (:pepe:)",
            value: data?.inReactions.custom,
            tooltip: reactionSupportTooltip
        },
        */
        {
            type: "number",
            formatter: "integer",
            label: "Unique emojis used in reactions",
            value: data?.inReactions.unique,
            tooltip: reactionSupportTooltip,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Messages with at least one emoji reacted",
            value: data?.inReactions.oncePerMessage,
            tooltip: reactionSupportTooltip,
        },
    ];

    return <DottedTable lines={lines} />;
};

export default MessagesStatsTable;
