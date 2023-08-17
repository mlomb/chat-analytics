import { useBlockData } from "@report/BlockHook";
import { createActivitySplitted } from "@report/components/viz/amcharts/Activity";
import { AmCharts5Chart } from "@report/components/viz/amcharts/AmCharts5Chart";

const createChart = createActivitySplitted({
    yAxisLabel: "Time spent on calls",
    yAxisType: "duration",
    tooltipLabel: "{valueY.formatDuration()} spent on calls",
});

export const CallsActivity = () => (
    <AmCharts5Chart
        style={{
            minHeight: 617,
            marginLeft: 5,
            marginBottom: 8,
        }}
        data={useBlockData("calls/activty")?.weekdayHourActivity}
        create={createChart}
    />
);
