import { MessagesStatsBlock } from "@pipeline/blocks/MessagesStats";

import PieChart from "@report/components/viz/PieChart";
import SimpleTable from "@report/components/viz/SimpleTable";

const MessagesStats = ({ data }: { data: MessagesStatsBlock }) => {
    return (
        <div>
            {data ? JSON.stringify(data) : "No data"}
            <SimpleTable />
            <PieChart />
        </div>
    );
};

export default MessagesStats;
