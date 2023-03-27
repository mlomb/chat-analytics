import { Color, Container } from "@amcharts/amcharts5";
import {
    AxisRendererX,
    AxisRendererY,
    DateAxis,
    StepLineSeries,
    ValueAxis,
    XYChart,
    XYChartScrollbar,
} from "@amcharts/amcharts5/xy";
import { DateItem } from "@pipeline/aggregate/Common";
import { useBlockData } from "@report/BlockHook";
import { getWorker } from "@report/WorkerWrapper";
import { LoadingGroup } from "@report/components/LoadingGroup";
import { AmCharts5Chart } from "@report/components/viz/amcharts/AmCharts5Chart";

const SB_HEIGHT = 50;
const RESETS = {
    paddingBottom: 0,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginBottom: 0,
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
};

const createTimeSelector = (c: Container) => {
    const chart = c.root.container.children.push(
        XYChart.new(c.root, {
            layout: c.root.verticalLayout,
            ...RESETS,
        })
    );

    const scrollbarX = XYChartScrollbar.new(c.root, {
        orientation: "horizontal",
        height: SB_HEIGHT,
        ...RESETS,
    });

    scrollbarX.get("background")!.setAll({
        fill: Color.fromHex(0x1e2529),
        fillOpacity: 0.01,
    });
    chart.plotContainer.set("visible", false);
    chart.rightAxesContainer.set("visible", false);
    chart.leftAxesContainer.set("visible", false);
    chart.bottomAxesContainer.set("visible", false);

    chart.set("scrollbarX", scrollbarX);

    const xAxis = scrollbarX.chart.xAxes.push(
        DateAxis.new(c.root, {
            baseInterval: { timeUnit: "day", count: 1 },
            renderer: AxisRendererX.new(c.root, {}),
        })
    );

    const yAxis = scrollbarX.chart.yAxes.push(
        ValueAxis.new(c.root, {
            renderer: AxisRendererY.new(c.root, {}),
            min: 0,
            maxPrecision: 0,
        })
    );

    const series = scrollbarX.chart.series.push(
        StepLineSeries.new(c.root, {
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "ts",
            valueYField: "v",
            noRisers: true,
        })
    );

    series.strokes.template.setAll({
        strokeWidth: 2,
        strokeOpacity: 0.5,
    });
    series.fills.template.setAll({
        fillOpacity: 0.2,
        visible: true,
    });

    const dateAxisChanged = (ev: { start: number; end: number }) => {
        let start = xAxis.positionToDate(ev.start);
        let end = xAxis.positionToDate(ev.end);
        if (start > end) [start, end] = [end, start];
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            getWorker().updateTimeRange(start, end);
        }
    };
    scrollbarX.events.on("rangechanged", dateAxisChanged);

    return (data: DateItem[]) => {
        series.data.setAll(data);
    };
};

const TimeSelector = () => (
    <AmCharts5Chart
        create={createTimeSelector}
        data={useBlockData("messages/per-period")?.perDay}
        className="TimeSelector"
        style={{
            height: SB_HEIGHT + 1,
        }}
    />
);

export default () => <LoadingGroup children={() => <TimeSelector />} />;
