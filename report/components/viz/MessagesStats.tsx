import PieChart from "@report/components/viz/PieChart";
import DottedTable from "@report/components/viz/DottedTable";
import { MessagesStats } from "@pipeline/aggregate/blocks/MessagesStats";

const MessagesStats = ({ data }: { data: MessagesStats }) => {
    return (
        <div>
            <DottedTable
                lines={[
                    ["Total messages", data.total, false],
                    ["Average messages per day", data.avgDay, true],
                    ["Average message length", 0, false],
                ]}
            />
        </div>
    );
};

export default MessagesStats;
