import { useEffect, useLayoutEffect, useRef, useState } from "react";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

import { dataProvider } from "@report/DataProvider";
import { MessagesPerCycleBlock } from "@pipeline/blocks/MessagesPerCycle";
import { Themes } from "./AmCharts5";

const MessagesGraph = ({ data }: { data: MessagesPerCycleBlock }) => {
    const chartDiv = useRef<HTMLDivElement>(null);
    const [charts, setCharts] = useState<{
        stepSeries: am5xy.StepLineSeries | null;
        columnSeries: am5xy.ColumnSeries | null;
    }>({
        stepSeries: null,
        columnSeries: null,
    });

    useLayoutEffect(() => {
        const root = am5.Root.new(chartDiv.current!);
        root.setThemes(Themes(root, false)); // Do not animate!

        const chartStep = root.container.children.push(
            am5xy.XYChart.new(root, {
                layout: root.verticalLayout,
            })
        );
        chartStep.zoomOutButton.set("forceHidden", true);
        chartStep.set("cursor", am5xy.XYCursor.new(root, {}));
        //chartStep.get("cursor")!.lineX.set("visible", false);
        chartStep.get("cursor")!.lineY.set("visible", false);

        const createValueAxis = (chart: am5xy.XYChart) => {
            return chart.yAxes.push(
                am5xy.ValueAxis.new(root, {
                    renderer: am5xy.AxisRendererY.new(root, {
                        inside: false,
                    }),
                    min: 0,
                    maxPrecision: 0,
                })
            );
        };

        const createDateAxis = (chart: am5xy.XYChart, timeUnit: "day" | "month") => {
            return chart.xAxes.push(
                am5xy.DateAxis.new(root, {
                    baseInterval: {
                        timeUnit,
                        count: 1,
                    },
                    // makes sure axis of both graphs can be aligned
                    extraMin: 0.1,
                    extraMax: 0.1,
                    periodChangeDateFormats: {
                        month: "[bold]yyyy[/]",
                    },
                    renderer: am5xy.AxisRendererX.new(root, {}),
                })
            );
        };

        const stepSeries = chartStep.series.push(
            am5xy.StepLineSeries.new(root, {
                valueXField: "date",
                valueYField: "messages",
                xAxis: createDateAxis(chartStep, "day"),
                yAxis: createValueAxis(chartStep),
                noRisers: true,
                stroke: am5.color(0x479adb),
                fill: am5.color(0x479adb),
                /*tooltipText: "[bold]{valueX.formatDate('EEEE, MMM dd yyyy')}:[/] {messages} messages sent",
            tooltip: am5.Tooltip.new(root, {
                pointerOrientation: "horizontal",
            })*/
            })
        );

        chartStep.yAxes.getIndex(0)!.children.unshift(
            am5.Label.new(root, {
                rotation: -90,
                text: "Messages sent",
                y: am5.p50,
                centerX: am5.p50,
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

        const chartColumn = root.container.children.push(
            am5xy.XYChart.new(root, {
                layout: root.verticalLayout,
                height: 100,
            })
        );
        chartColumn.zoomOutButton.set("forceHidden", true);
        chartColumn.set("cursor", am5xy.XYCursor.new(root, {}));
        chartColumn.get("cursor")!.lineX.set("visible", false);
        chartColumn.get("cursor")!.lineY.set("visible", false);

        const columnSeries = chartColumn.series.push(
            am5xy.ColumnSeries.new(root, {
                valueXField: "date",
                valueYField: "messages",
                xAxis: createDateAxis(chartColumn, "month"),
                yAxis: createValueAxis(chartColumn),
                fill: am5.color(0x479adb),
                /*tooltipText: "[bold]{valueX.formatDate('MMM yyyy')}:[/] {messages} messages sent",
            tooltip: am5.Tooltip.new(root, {
                pointerOrientation: "horizontal",
            })*/
            })
        );
        chartColumn.yAxes.getIndex(0)!.children.unshift(
            am5.Label.new(root, {
                rotation: -90,
                text: ".....",
                // invisible text to align with the other graph
                opacity: 0,
                y: am5.p50,
                centerX: am5.p50,
            })
        );

        root.container.set("layout", root.verticalLayout);

        const onZoom = () =>
            [chartStep, chartColumn].forEach((c) =>
                (c.xAxes.getIndex(0) as am5xy.DateAxis<any>).zoomToDates(
                    dataProvider.getActiveStartDate(),
                    dataProvider.getActiveEndDate()
                )
            );

        dataProvider.on("trigger-time", onZoom);
        onZoom();
        setCharts({ stepSeries, columnSeries });

        return () => {
            setCharts({ stepSeries: null, columnSeries: null });
            dataProvider.off("trigger-time", onZoom);
            root.dispose();
        };
    }, []);

    useEffect(() => {
        if (data) {
            // TODO: update efficient
            charts.stepSeries?.data.setAll(data.perDay);
            charts.columnSeries?.data.setAll(data.perMonth);
        }
    }, [charts, data]);

    return (
        <div
            ref={chartDiv}
            style={{
                width: "100%",
                height: "89%",
                minHeight: 600,
                marginLeft: 5,
                marginBottom: 5,
            }}
        ></div>
    );
};

export default MessagesGraph;
