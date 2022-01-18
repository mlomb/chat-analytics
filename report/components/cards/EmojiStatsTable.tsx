import { EmojiStats } from "@pipeline/aggregate/blocks/EmojiStats";
import DottedTable, { Line } from "@report/components/viz/DottedTable";
import { useDataProvider } from "@report/DataProvider";

const MessagesStatsTable = ({ data }: { data?: EmojiStats }) => {
    const dataProvider = useDataProvider();

    const lines: Line[] = [
        {
            type: "number",
            formatter: "integer",
            label: "Total messages sent",
            value: 0,
        },
    ];

    return (
        <div>
            <DottedTable lines={lines} />
        </div>
    );
};

export default MessagesStatsTable;
