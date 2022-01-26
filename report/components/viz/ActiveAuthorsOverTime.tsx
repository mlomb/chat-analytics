import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Root, Color, Label, p50, Tooltip, Bullet, Circle } from "@amcharts/amcharts5";
import {
    XYChart,
    DateAxis,
    ValueAxis,
    AxisRendererX,
    AxisRendererY,
    StepLineSeries,
    ColumnSeries,
    XYCursor,
    XYSeries,
    LineSeries,
    SmoothedXLineSeries,
} from "@amcharts/amcharts5/xy";

import { useDataProvider } from "@report/DataProvider";
import { ActiveAuthors } from "@pipeline/aggregate/blocks/ActiveAuthors";
import { Themes } from "./AmCharts5";
import { TimeUnit } from "@amcharts/amcharts5/.internal/core/util/Time";

const ActiveAuthorsOverTime = ({ data, options }: { data?: ActiveAuthors; options: number[] }) => {
    const dataProvider = useDataProvider();
    const chartDiv = useRef<HTMLDivElement>(null);

    const xAxisRef = useRef<DateAxis<any> | null>(null);
    const seriesRef = useRef<XYSeries | null>(null);

    useLayoutEffect(() => {
        const root = Root.new(chartDiv.current!);
        root.setThemes(Themes(root, false)); // Do not animate!

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
                // make sure we get the full scale
                min: 0,
            })
        );
        yAxis.children.unshift(
            Label.new(root, {
                rotation: -90,
                text: "Active users in period",
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
        });
        series.bullets.push(function () {
            return Bullet.new(root, {
                locationY: 0,
                sprite: Circle.new(root, {
                    radius: 4,
                    stroke: Color.fromHex(0x57b1ff),
                    strokeWidth: 2,
                    fill: Color.fromHex(0x1861a1),
                }),
            });
        });

        seriesRef.current = series;

        const onZoom = () => xAxis.zoomToDates(dataProvider.getActiveStartDate(), dataProvider.getActiveEndDate(), 0);
        dataProvider.on("trigger-time", onZoom);
        // must wait to datavalidated before zooming
        seriesRef.current!.events.once("datavalidated", onZoom);

        return () => {
            dataProvider.off("trigger-time", onZoom);
            root.dispose();
            xAxisRef.current = null;
            seriesRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (data) {
            // TODO: update efficient
            //seriesRef.current?.data.setAll([data.perDay, data.perWeek, data.perMonth][options[0]]);
            seriesRef.current?.data.setAll(data.perMonth);
        }
    }, [seriesRef.current, data, options]);

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
