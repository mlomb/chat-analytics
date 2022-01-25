import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Root, Color, Label, p50 } from "@amcharts/amcharts5";
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
} from "@amcharts/amcharts5/xy";

import { useDataProvider } from "@report/DataProvider";
import { MessagesPerCycle } from "@pipeline/aggregate/blocks/MessagesPerCycle";
import { Themes } from "./AmCharts5";
import { TimeUnit } from "@amcharts/amcharts5/.internal/core/util/Time";

const MessagesGraph = ({ data, options }: { data?: MessagesPerCycle; options: number[] }) => {
    const dataProvider = useDataProvider();
    const chartDiv = useRef<HTMLDivElement>(null);

    const xAxisRef = useRef<DateAxis<any> | null>(null);
    const seriesRef = useRef<XYSeries | null>(null);

    const graphType = options[0] === 0 ? "step" : "column";

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
                text: "Messages sent",
                y: p50,
                centerX: p50,
            })
        );
        xAxisRef.current = xAxis;

        if (graphType === "step") {
            const stepSeries = chart.series.push(
                StepLineSeries.new(root, {
                    valueXField: "d",
                    valueYField: "m",
                    xAxis: xAxis,
                    yAxis: yAxis,
                    noRisers: true,
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

            seriesRef.current = stepSeries;
        } else {
            const columnSeries = chart.series.push(
                ColumnSeries.new(root, {
                    valueXField: "d",
                    valueYField: "m",
                    xAxis: xAxis,
                    yAxis: yAxis,
                    fill: Color.fromHex(0x479adb),
                })
            );

            seriesRef.current = columnSeries;
        }

        const onZoom = () => {
            xAxis.zoomToDates(dataProvider.getActiveStartDate(), dataProvider.getActiveEndDate(), 0);
        };
        dataProvider.on("trigger-time", onZoom);
        // must wait to datavalidated before zooming
        seriesRef.current!.events.once("datavalidated", onZoom);

        return () => {
            dataProvider.off("trigger-time", onZoom);
            root.dispose();
            xAxisRef.current = null;
            seriesRef.current = null;
        };
    }, [graphType]);

    useEffect(() => {
        xAxisRef.current?.set("baseInterval", { timeUnit: ["day", "week", "month"][options[0]] as TimeUnit, count: 1 });
        if (data) {
            // TODO: update efficient
            seriesRef.current?.data.setAll([data.perDay, data.perWeek, data.perMonth][options[0]]);
        }
    }, [seriesRef.current, data, options]);

    return (
        <div
            ref={chartDiv}
            style={{
                minHeight: 550,
                marginLeft: 5,
                marginBottom: 8,
            }}
        />
    );
};

export default MessagesGraph;
