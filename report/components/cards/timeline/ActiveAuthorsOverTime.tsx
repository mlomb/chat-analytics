import { Bullet, Circle, Color, Container, Label, Tooltip, p50 } from "@amcharts/amcharts5";
import {
    AxisRendererX,
    AxisRendererY,
    DateAxis,
    SmoothedXLineSeries,
    ValueAxis,
    XYChart,
} from "@amcharts/amcharts5/xy";
import { ActiveAuthors } from "@pipeline/aggregate/blocks/timeline/ActiveAuthors";
import { useBlockData } from "@report/BlockHook";
import { syncAxisWithTimeFilter } from "@report/components/viz/amcharts/AmCharts5";
import { AmCharts5Chart, CreateFn } from "@report/components/viz/amcharts/AmCharts5Chart";

const createChart: CreateFn<ActiveAuthors> = (c: Container) => {
    const chart = c.root.container.children.push(
        XYChart.new(c.root, {
            layout: c.root.verticalLayout,
        })
    );
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
            text: "Active authors in period",
            y: p50,
            centerX: p50,
        })
    );

    const series = chart.series.push(
        SmoothedXLineSeries.new(c.root, {
            valueXField: "ts",
            valueYField: "value",
            xAxis: xAxis,
            yAxis: yAxis,
            stroke: Color.fromHex(0x57b1ff),
            fill: Color.fromHex(0x57b1ff),
            tooltip: Tooltip.new(c.root, {
                labelText: "{valueY}",
            }),
        })
    );
    series.fills.template.setAll({
        visible: true,
        fillOpacity: 0.2,
        templateField: "lineSettings",
    });
    series.strokes.template.setAll({
        templateField: "lineSettings",
    });
    series.bullets.push(() =>
        Bullet.new(c.root, {
            locationY: 0,
            sprite: Circle.new(c.root, {
                radius: 4,
                stroke: Color.fromHex(0x57b1ff),
                strokeWidth: 2,
                fill: Color.fromHex(0x1861a1),
            }),
        })
    );

    const setData = (data: ActiveAuthors) => {
        if (data.perMonth.length > 1) {
            // @ts-ignore
            data.perMonth[data.perMonth.length - 2].lineSettings = {
                strokeDasharray: [3, 3],
                fillOpacity: 0.1,
            };
        }
        series.data.setAll(data.perMonth);
    };

    const cleanupAxisSync = syncAxisWithTimeFilter([series], xAxis, yAxis);
    // since we are syncing the axis, we don't want the zoom out button
    chart.zoomOutButton.set("forceHidden", true);

    return [setData, cleanupAxisSync];
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
