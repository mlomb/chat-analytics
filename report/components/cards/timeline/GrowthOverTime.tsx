import { Container } from "@amcharts/amcharts5";
import { DateItem } from "@pipeline/aggregate/Common";
import { useBlockData } from "@report/BlockHook";
import { createYAxisLabel } from "@report/components/viz/amcharts/AmCharts5";
import { AmCharts5Chart, CreateFn } from "@report/components/viz/amcharts/AmCharts5Chart";
import { createTimeline } from "@report/components/viz/amcharts/Timeline";

const createChart: CreateFn<DateItem[][]> = (c: Container) => {
    const { yAxis, setData, cleanup } = createTimeline(c, "day", "step");

    createYAxisLabel(yAxis, "Accumulated unique authors");

    return [setData, cleanup];
};

const GrowthOverTime = () => (
    <AmCharts5Chart
        create={createChart}
        data={useBlockData("timeline/growth")?.perGuildPerDay}
        style={{
            minHeight: 500,
            marginLeft: 5,
            marginBottom: 8,
        }}
    />
);

export default GrowthOverTime;
