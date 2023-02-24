import { useLayoutEffect, useRef } from "react";

import { Bullet, Circle, Color, Label, Root, Tooltip, p50 } from "@amcharts/amcharts5";
import {
    AxisRendererX,
    AxisRendererY,
    DateAxis,
    SmoothedXLineSeries,
    ValueAxis,
    XYChart,
    XYSeries,
} from "@amcharts/amcharts5/xy";
import { useBlockData } from "@report/BlockHook";

import { Themes, enableDebouncedResize, syncAxisWithTimeFilter } from "../../viz/amcharts/AmCharts5";

const ActiveAuthorsOverTime = () => {
    const chartDiv = useRef<HTMLDivElement>(null);
    const xAxisRef = useRef<DateAxis<any> | null>(null);
    const seriesRef = useRef<XYSeries | null>(null);
    const data = useBlockData("timeline/active-authors");

    useLayoutEffect(() => {
        const root = Root.new(chartDiv.current!);
        root.setThemes(Themes(root, false)); // Do not animate!
        const cleanupDebounce = enableDebouncedResize(root);

        const chart = root.container.children.push(
            XYChart.new(root, {
                layout: root.verticalLayout,
            })
        );
        chart.zoomOutButton.set("forceHidden", true);

        const xAxis = chart.xAxes.push(
            DateAxis.new(root, {
                baseInterval: { timeUnit: "day", count: 1 },
                renderer: AxisRendererX.new(root, {}),
            })
        );
        const yAxis = chart.yAxes.push(
            ValueAxis.new(root, {
                renderer: AxisRendererY.new(root, {}),
                maxPrecision: 0,
                min: 0,
            })
        );
        yAxis.children.unshift(
            Label.new(root, {
                rotation: -90,
                text: "Active authors in period",
                y: p50,
                centerX: p50,
            })
        );
        xAxisRef.current = xAxis;

        const series = chart.series.push(
            SmoothedXLineSeries.new(root, {
                valueXField: "ts",
                valueYField: "value",
                xAxis: xAxis,
                yAxis: yAxis,
                stroke: Color.fromHex(0x57b1ff),
                fill: Color.fromHex(0x57b1ff),
                tooltip: Tooltip.new(root, {
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
            Bullet.new(root, {
                locationY: 0,
                sprite: Circle.new(root, {
                    radius: 4,
                    stroke: Color.fromHex(0x57b1ff),
                    strokeWidth: 2,
                    fill: Color.fromHex(0x1861a1),
                }),
            })
        );

        seriesRef.current = series;

        const cleanup = syncAxisWithTimeFilter([seriesRef.current], xAxis, yAxis);

        return () => {
            cleanupDebounce();
            cleanup();
            root.dispose();
            xAxisRef.current = null;
            seriesRef.current = null;
        };
    }, []);

    useLayoutEffect(() => {
        if (data) {
            if (data.perMonth.length > 1) {
                // @ts-ignore
                data.perMonth[data.perMonth.length - 2].lineSettings = {
                    strokeDasharray: [3, 3],
                    fillOpacity: 0.1,
                };
            }
            seriesRef.current?.data.setAll(data.perMonth);
        }
    }, [seriesRef.current, data]);

    return (
        <div
            ref={chartDiv}
            style={{
                minHeight: 500,
                marginLeft: 5,
                marginBottom: 8,
            }}
        />
    );
};

export default ActiveAuthorsOverTime;
