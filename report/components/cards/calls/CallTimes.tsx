import { useBlockData } from "@report/BlockHook";
import { AmCharts5Chart } from "@report/components/viz/amcharts/AmCharts5Chart";
import { createDistributionChart } from "@report/components/viz/amcharts/Distribution";

const CallTimes = () => {
    const data = useBlockData("calls/stats");

    return (
        <>
            <AmCharts5Chart
                create={createDistributionChart({
                    tooltipLabel: "[bold]{valueY} call(s) [/] lasted\n between [bold]{from}-{to} seconds[/]",
                    xAxisType: "duration",
                    xAxisLabel: "Call duration",
                    yAxisLabel: "Number of calls",
                })}
                data={data?.durationDistribution}
                style={{
                    minHeight: 250,
                    marginLeft: 5,
                    marginBottom: 8,
                }}
            />
            {/*
            <hr />
            <AmCharts5Chart
                create={createDistributionChart({
                    tooltipLabel: "xxx",
                    xAxisType: "duration",
                    xAxisLabel: "Call duration",
                    yAxisLabel: "Number of calls",
                })}
                data={data?.timesBetweenDistribution}
                style={{
                    minHeight: 250,
                    marginLeft: 5,
                    marginBottom: 8,
                }}
            />
            */}
        </>
    );
};

export default CallTimes;
