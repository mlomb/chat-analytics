import { Bullet, Circle, Color, Container, Legend, Tooltip, p50 } from "@amcharts/amcharts5";
import {
    AxisRendererX,
    AxisRendererY,
    DateAxis,
    SmoothedXLineSeries,
    ValueAxis,
    XYChart,
    XYCursor,
} from "@amcharts/amcharts5/xy";
import { ActiveAuthors } from "@pipeline/aggregate/blocks/timeline/ActiveAuthors";
import { Guild } from "@pipeline/process/Types";
import { useBlockData } from "@report/BlockHook";
import { getDatabase } from "@report/WorkerWrapper";
import { createYAxisLabel, syncAxisWithTimeFilter } from "@report/components/viz/amcharts/AmCharts5";
import { AmCharts5Chart, CreateFn } from "@report/components/viz/amcharts/AmCharts5Chart";

const createChart: CreateFn<ActiveAuthors> = (c: Container) => {
    const db = getDatabase();

    const cursor = XYCursor.new(c.root, {
        behavior: "none",
    });
    cursor.lineY.set("visible", false);

    const chart = c.root.container.children.push(
        XYChart.new(c.root, {
            layout: c.root.verticalLayout,
            cursor,
        })
    );

    chart.get("colors")!.set("step", 3);

    const xAxis = chart.xAxes.push(
        DateAxis.new(c.root, {
            baseInterval: { timeUnit: "month", count: 1 },
            renderer: AxisRendererX.new(c.root, {}),
            tooltip: Tooltip.new(c.root, {}),
        })
    );
    const yAxis = chart.yAxes.push(
        ValueAxis.new(c.root, {
            renderer: AxisRendererY.new(c.root, {}),
            maxPrecision: 0, // integers
            min: 0, // always bottom fixed at 0
        })
    );

    createYAxisLabel(yAxis, "Active authors during month");

    const createSeries = (guild: Guild) => {
        const series = chart.series.push(
            SmoothedXLineSeries.new(c.root, {
                name: guild.name,
                valueXField: "ts",
                valueYField: "value",
                xAxis: xAxis,
                yAxis: yAxis,
                legendLabelText: "[{stroke}]{name}[/][bold #888]{categoryX}[/]",
                legendRangeLabelText: "[{stroke}]{name}[/]",
                legendValueText: "{valueY}",
                legendRangeValueText: "[bold #888]-[/]",
                minBulletDistance: 8, // hide bullets if they are too close
            })
        );
        series.fills.template.setAll({
            visible: true,
            fillOpacity: 0.1,
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
                    stroke: series.get("fill"),
                    strokeWidth: 2,
                    fill: Color.brighten(series.get("fill")!, -0.3),
                }),
            })
        );

        return series;
    };

    const series = db.guilds.map(createSeries);

    const legend = chart.children.unshift(
        Legend.new(c.root, {
            centerX: p50,
            x: p50,
            marginTop: -20,
            marginBottom: 10,
        })
    );
    legend.data.setAll(series);

    const setData = (data: ActiveAuthors) => {
        for (let i = 0; i < data.perGuild.length; i++) {
            const items = data.perGuild[i].perMonth;

            if (items.length > 0) series[i].show();
            else series[i].hide();

            if (items.length > 1) {
                // @ts-expect-error
                items[items.length - 2].lineSettings = {
                    strokeDasharray: [3, 3],
                    fillOpacity: 0.05,
                };
            }

            series[i].data.setAll(items);
        }
    };

    const cleanupAxisSync = syncAxisWithTimeFilter(series, xAxis, yAxis);

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
