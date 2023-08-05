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
        {
            type: "number",
            formatter: "time",
            label: "Average call duration",
            value: stats?.averageDuration,
        },
        {
            type: "number",
            formatter: "time",
            label: "Median call duration",
            value: stats?.medianDuration,
        },
        {
            type: "separator",
        },
        {
            type: "number",
            formatter: "time",
            label: "Longest call",
            value: stats?.longestCall?.duration,
            tooltip: (
                <>
                    The call was initiated on <b>{formatDatetime("ymdhm", stats?.longestCall?.start)}</b>
                </>
            ),
        },
    ];

    return <DottedTable lines={lines} />;
};

export default CallsStatsTable;
