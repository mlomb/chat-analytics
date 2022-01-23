import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Root, Color, Label, p50, Legend, Tooltip } from "@amcharts/amcharts5";
import {
    XYChart,
    DateAxis,
    ValueAxis,
    AxisRendererX,
    AxisRendererY,
    StepLineSeries,
    ColumnSeries,
    XYCursor,
} from "@amcharts/amcharts5/xy";

import { useDataProvider } from "@report/DataProvider";
import { SentimentInDate, SentimentPerCycle } from "@pipeline/aggregate/blocks/SentimentPerCycle";
import { Themes } from "./AmCharts5";

const SentimentOverTime = ({ data, options }: { data?: SentimentPerCycle; options: number[] }) => {
    const dataProvider = useDataProvider();
    const chartDiv = useRef<HTMLDivElement>(null);

    const xAxisRef = useRef<DateAxis<any> | null>(null);
    const yAxisRef = useRef<ValueAxis<any> | null>(null);
    const seriesRef = useRef<ColumnSeries[]>([]);

    useLayoutEffect(() => {
        const root = Root.new(chartDiv.current!);
        root.setThemes(Themes(root, false));

        let chart = root.container.children.push(
            XYChart.new(root, {
                layout: root.horizontalLayout,
            })
        );
        chart.zoomOutButton.set("forceHidden", true);
        let legend = chart.children.push(
            Legend.new(root, {
                centerX: p50,
                x: p50,
            })
        );

        let xAxis = chart.xAxes.push(
            DateAxis.new(root, {
                baseInterval: { timeUnit: "week", count: 1 },
                renderer: AxisRendererX.new(root, {}),
            })
        );
        let yAxis = chart.yAxes.push(
            ValueAxis.new(root, {
                renderer: AxisRendererY.new(root, {}),
            })
        );

        function createSeries(field: keyof SentimentInDate, title: string, color: Color) {
            let series = chart.series.push(
                ColumnSeries.new(root, {
                    xAxis: xAxis,
                    yAxis: yAxis,
                    valueXField: "t",
                    valueYField: field,
                    name: title,
                    fill: color,
                    stacked: true,
                })
            );

            seriesRef.current.push(series);
        }

        createSeries("p", "Positive tokens", root.interfaceColors.get("positive")!);
        createSeries("n", "Negative tokens", root.interfaceColors.get("negative")!);

        xAxisRef.current = xAxis;
        yAxisRef.current = yAxis;

        // handle zoom
        const onZoom = () => {
            xAxis.zoomToDates(dataProvider.getActiveStartDate(), dataProvider.getActiveEndDate(), 0);
        };
        dataProvider.on("trigger-time", onZoom);
        // must wait to datavalidated before zooming
        seriesRef.current.forEach((c) => c.events.once("datavalidated", onZoom));

        return () => {
            dataProvider.off("trigger-time", onZoom);
            root.dispose();
            xAxisRef.current = null;
            yAxisRef.current = null;
            seriesRef.current = [];
        };
    }, []);

    useEffect(() => {
        xAxisRef.current?.set("baseInterval", { timeUnit: options[0] === 0 ? "week" : "month", count: 1 });
        // prettier-ignore
        yAxisRef.current?.setAll(options[1] === 0 ? {
            min: -100,
            max: 100,
            numberFormat: "#s'%'",
        } : {
            min: undefined,
            max: undefined,
            numberFormat: "#s",
        });
        const series = seriesRef.current;
        if (series) {
            if (options[1] === 0) {
                // % difference
                series[0].set("valueYField", "percDiffP");
                series[1].set("valueYField", "percDiffN");
            } else if (options[1] === 1) {
                // raw difference
                series[0].set("valueYField", "rawDiffP");
                series[1].set("valueYField", "rawDiffN");
            } else if (options[1] === 2) {
                // raw tokens
                series[0].set("valueYField", "p");
                series[1].set("valueYField", "n");
            }
            if (data) {
                series.forEach((s) => s.data.setAll(options[0] === 0 ? data.perWeek : data.perMonth));
            }
        }
    }, [data, options]);

    return (
        <div
            ref={chartDiv}
            style={{
                minHeight: 550,
                marginLeft: 5,
                marginBottom: 5,
            }}
        ></div>
    );
};

export default SentimentOverTime;
