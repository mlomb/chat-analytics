import { formatDatetime } from "@pipeline/Time";
import { useBlockData } from "@report/BlockHook";
import DottedTable, { Line } from "@report/components/viz/DottedTable";
import { AmCharts5Chart } from "@report/components/viz/amcharts/AmCharts5Chart";
import { createDistributionChart } from "@report/components/viz/amcharts/Distribution";

const CallsStatsTable = () => {
    const stats = useBlockData("calls/stats");

    const lines1: Line[] = [
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
            label: "Longest call",
            value: stats?.longestCall?.duration,
            tooltip: (
                <>
                    The call was initiated on <b>{formatDatetime("ymdhm", stats?.longestCall?.start)}</b>
                </>
            ),
        },
        {
            type: "number",
            formatter: "time",
            label: "Average call duration",
            value: stats?.durationDistribution.average,
        },
        {
            type: "number",
            formatter: "time",
            label: "Median call duration",
            value: stats?.durationDistribution.boxplot.median,
        },
    ];

    const lines2: Line[] = [
        {
            type: "separator",
        },
        {
            type: "number",
            formatter: "time",
            label: "Average time between calls",
            value: stats?.timesBetweenDistribution.average,
        },
        {
            type: "number",
            formatter: "time",
            label: "Median time between calls",
            value: stats?.timesBetweenDistribution.boxplot.median,
        },
    ];

    return (
        <>
            <DottedTable lines={lines1} />
            <center>
                <b>Call duration distribution</b>
            </center>
            <AmCharts5Chart
                create={createDistributionChart({
                    tooltipLabel: "[bold]{valueY} call(s) [/] lasted\n between [bold]{from}-{to} seconds[/]",
                    xAxisType: "duration",
                    xAxisLabel: "Call duration",
                    yAxisLabel: "Number of calls",
                })}
                data={stats?.durationDistribution}
                style={{
                    minHeight: 250,
                    marginLeft: 5,
                    marginBottom: 8,
                }}
            />
            <DottedTable lines={lines2} />
        </>
    );
};

export default CallsStatsTable;
