import { Bullet, Circle, Color, Container, Legend, Tooltip, p50 } from "@amcharts/amcharts5";
import { TimeUnit } from "@amcharts/amcharts5/.internal/core/util/Time";
import {
    AxisRendererX,
    AxisRendererY,
    DateAxis,
    IXYSeriesSettings,
    LineSeries,
    SmoothedXLineSeries,
    StepLineSeries,
    ValueAxis,
    XYChart,
    XYCursor,
    XYSeries,
} from "@amcharts/amcharts5/xy";
import { DateItem } from "@pipeline/aggregate/Common";
import { Guild } from "@pipeline/process/Types";
import { getDatabase } from "@report/WorkerWrapper";
import { syncAxisWithTimeFilter } from "@report/components/viz/amcharts/AmCharts5";

export const createTimeline = (c: Container, timeUnit: TimeUnit, seriesChart: "smoothed" | "step") => {
    const { root } = c;

    const db = getDatabase();

    const cursor = XYCursor.new(root, {
        behavior: "none",
    });
    cursor.lineY.set("visible", false);

    const chart = root.container.children.push(
        XYChart.new(root, {
            layout: root.verticalLayout,
            cursor,
        })
    );

    chart.setAll({
        paddingRight: 0,
        marginRight: 0,
    });

    chart.get("colors")!.set("step", 3);

    const xAxis = chart.xAxes.push(
        DateAxis.new(root, {
            baseInterval: { timeUnit, count: 1 },
            renderer: AxisRendererX.new(root, {}),
            tooltip: Tooltip.new(root, {}),
        })
    );
    const yAxis = chart.yAxes.push(
        ValueAxis.new(root, {
            renderer: AxisRendererY.new(root, {}),
            maxPrecision: 0, // integers
            min: 0, // always bottom fixed at 0
        })
    );

    const createSeries = (guild: Guild) => {
        let series: LineSeries;

        const settings: IXYSeriesSettings = {
            name: guild.name,
            valueXField: "ts",
            valueYField: "v",
            xAxis: xAxis,
            yAxis: yAxis,
            legendLabelText: "[{stroke}]{name}[/][bold #888]{categoryX}[/]",
            legendRangeLabelText: "[{stroke}]{name}[/]",
            legendValueText: "{valueY}",
            legendRangeValueText: "[bold #888]-[/]",
            minBulletDistance: 8, // hide bullets if they are too close
        };

        if (seriesChart === "step") {
            series = StepLineSeries.new(root, settings);
            series.strokes.template.setAll({
                visible: true,
                strokeWidth: 2,
                strokeOpacity: 0.8,
            });
        } else {
            // seriesChart === "smoothed"
            series = SmoothedXLineSeries.new(root, settings);
            series.bullets.push(() =>
                Bullet.new(root, {
                    locationY: 0,
                    sprite: Circle.new(root, {
                        radius: 4,
                        stroke: series.get("fill"),
                        strokeWidth: 2,
                        fill: Color.brighten(series.get("fill")!, -0.3),
                    }),
                })
            );
        }
        series.fills.template.setAll({
            visible: true,
            fillOpacity: 0.1,
            templateField: "lineSettings",
        });
        series.strokes.template.setAll({
            templateField: "lineSettings",
        });

        chart.series.push(series);

        return series;
    };

    const series = db.guilds.map(createSeries);

    const legend = chart.children.unshift(
        Legend.new(root, {
            centerX: p50,
            x: p50,
            marginTop: -20,
            marginBottom: 10,
        })
    );
    legend.data.setAll(series);

    const setData = (data: DateItem[][]) => {
        for (let i = 0; i < data.length; i++) {
            const items = data[i];

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

    return {
        yAxis,
        setData,
        cleanup: cleanupAxisSync,
    };
};
