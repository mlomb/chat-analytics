import { useBlockData } from "@report/BlockHook";
import { createActivityHeatmap, createActivitySplitted } from "@report/components/viz/amcharts/Activity";
import { AmCharts5Chart } from "@report/components/viz/amcharts/AmCharts5Chart";

const createActivitySplittedFn = createActivitySplitted({
    yAxisLabel: "Messages sent",
    yAxisType: "value",
    tooltipLabel: "{valueY} messages sent",
});

export const WeekdayHourActivity = ({ options }: { options: number[] }) => (
    <AmCharts5Chart
        style={{
            minHeight: 617,
            marginLeft: 5,
            marginBottom: 8,
        }}
        data={useBlockData("messages/stats")?.weekdayHourActivity}
        create={options[0] === 0 ? createActivitySplittedFn : createActivityHeatmap}
    />
);
