import { Container } from "@amcharts/amcharts5";
import { ActiveAuthors } from "@pipeline/aggregate/blocks/timeline/ActiveAuthors";
import { useBlockData } from "@report/BlockHook";
import { createYAxisLabel } from "@report/components/viz/amcharts/AmCharts5";
import { AmCharts5Chart, CreateFn } from "@report/components/viz/amcharts/AmCharts5Chart";
import { createTimeline } from "@report/components/viz/amcharts/Timeline";

const createChart: CreateFn<ActiveAuthors> = (c: Container) => {
    const { yAxis, setData, cleanup } = createTimeline(c);

    createYAxisLabel(yAxis, "Active authors during month");

    return [setData, cleanup];
};

const ActiveAuthorsOverTime = () => (
    <AmCharts5Chart
        create={createChart}
        data={useBlockData("timeline/active-authors")}
        style={{
            minHeight: 500,
            marginLeft: 5,
            marginBottom: 8,
        }}
    />
);

export default ActiveAuthorsOverTime;
