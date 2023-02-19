import { useLayoutEffect, useRef } from "react";

import { Color, Label, Root, Tooltip, p50 } from "@amcharts/amcharts5";
import { TimeUnit } from "@amcharts/amcharts5/.internal/core/util/Time";
import {
    AxisRendererX,
    AxisRendererY,
    ColumnSeries,
    DateAxis,
    StepLineSeries,
    ValueAxis,
    XYChart,
    XYCursor,
    XYSeries,
} from "@amcharts/amcharts5/xy";
import { MessagesPerCycle } from "@pipeline/aggregate/blocks/messages/MessagesPerCycle";

import { Themes, enableDebouncedResize, syncAxisWithTimeFilter } from "../../viz/amcharts/AmCharts5";

const MessagesGraph = ({ data, options }: { data?: MessagesPerCycle; options: number[] }) => {
    const chartDiv = useRef<HTMLDivElement>(null);
    const xAxisRef = useRef<DateAxis<any> | null>(null);
    const seriesRef = useRef<XYSeries | null>(null);

    const graphType = options[0] === 0 ? "step" : "column";

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

        const cursor = chart.set("cursor", XYCursor.new(root, {}));
        cursor.lineX.set("visible", false);
        cursor.lineY.set("visible", false);

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
                    stroke: Color.fromHex(0x57b1ff),
                    fill: Color.fromHex(0x57b1ff),
                    tooltip: Tooltip.new(root, { labelText: "{valueY}" }),
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
            seriesRef.current = chart.series.push(
                ColumnSeries.new(root, {
                    valueXField: "d",
                    valueYField: "m",
                    xAxis: xAxis,
                    yAxis: yAxis,
                    fill: Color.fromHex(0x479adb),
                    tooltip: Tooltip.new(root, { labelText: "{valueY}" }),
                })
            );
        }

        const cleanup = syncAxisWithTimeFilter([seriesRef.current], xAxis, yAxis);

        return () => {
            cleanup();
            cleanupDebounce();
            root.dispose();
            xAxisRef.current = null;
            seriesRef.current = null;
        };
    }, [graphType]);

    useLayoutEffect(() => {
        xAxisRef.current?.set("baseInterval", { timeUnit: ["day", "week", "month"][options[0]] as TimeUnit, count: 1 });
        if (seriesRef.current) {
            if (data) {
                // TODO: update efficient
                seriesRef.current?.data.setAll([data.perDay, data.perWeek, data.perMonth][options[0]]);
            }
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
