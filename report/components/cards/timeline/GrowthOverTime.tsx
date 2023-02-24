import { Color, Container, Label, p50 } from "@amcharts/amcharts5";
import { AxisRendererX, AxisRendererY, DateAxis, StepLineSeries, ValueAxis, XYChart } from "@amcharts/amcharts5/xy";
import { GrowthTimeline } from "@pipeline/aggregate/blocks/timeline/Growth";
import { useBlockData } from "@report/BlockHook";
import { syncAxisWithTimeFilter } from "@report/components/viz/amcharts/AmCharts5";
import { AmCharts5Chart, CreateFn } from "@report/components/viz/amcharts/AmCharts5Chart";

const createChart: CreateFn<GrowthTimeline> = (c: Container) => {
    const chart = c.root.container.children.push(XYChart.new(c.root, {}));
    chart.zoomOutButton.set("forceHidden", true);

    const xAxis = chart.xAxes.push(
        DateAxis.new(c.root, {
            baseInterval: { timeUnit: "day", count: 1 },
            renderer: AxisRendererX.new(c.root, {}),
        })
    );
    const yAxis = chart.yAxes.push(
        ValueAxis.new(c.root, {
            renderer: AxisRendererY.new(c.root, {}),
            maxPrecision: 0,
            min: 0,
        })
    );
    yAxis.children.unshift(
        Label.new(c.root, {
            rotation: -90,
            text: "Total authors",
            y: p50,
            centerX: p50,
        })
    );

    const stepSeries = chart.series.push(
        StepLineSeries.new(c.root, {
            valueXField: "ts",
            valueYField: "value",
            xAxis: xAxis,
            yAxis: yAxis,
            stroke: Color.fromHex(0x479adb),
            fill: Color.fromHex(0x479adb),
        })
    );
    stepSeries.strokes.template.setAll({
        visible: true,
        strokeWidth: 2,
        strokeOpacity: 0.8,
    });
    stepSeries.fills.template.setAll({
        visible: true,
        fillOpacity: 0.2,
    });

    const setData = (data: GrowthTimeline) => {
        stepSeries.data.setAll(data.growth);
    };

    const cleanupAxisSync = syncAxisWithTimeFilter([stepSeries], xAxis, yAxis);
    // since we are syncing the axis, we don't want the zoom out button
    chart.zoomOutButton.set("forceHidden", true);

    return [setData, cleanupAxisSync];
};

const GrowthOverTime = () => (
    <AmCharts5Chart
        data={useBlockData("timeline/growth")}
        create={createChart}
        style={{
            minHeight: 500,
            marginLeft: 5,
            marginBottom: 8,
        }}
    />
);

export default GrowthOverTime;
