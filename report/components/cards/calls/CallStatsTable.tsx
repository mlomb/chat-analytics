import { AttachmentType } from "@pipeline/Attachments";
import { PlatformsInfo } from "@pipeline/Platforms";
import { formatDatetime } from "@pipeline/Time";
import { useBlockData } from "@report/BlockHook";
import { getDatabase } from "@report/WorkerWrapper";
import DottedTable, { Line } from "@report/components/viz/DottedTable";

const CallsStatsTable = () => {
    const stats = useBlockData("calls/stats");

    const db = getDatabase();
    const platformInfo = PlatformsInfo[db.config.platform];

    const lines: Line[] = [
        {
            type: "number",
            formatter: "integer",
            label: "Total calls",
            value: stats?.total,
        },
        {
            type: "number",
            formatter: "time",
            label: "Time spent on calls",
            value: stats?.secondsInCall,
        },
    ];

    return <DottedTable lines={lines} />;
};

export default CallsStatsTable;
