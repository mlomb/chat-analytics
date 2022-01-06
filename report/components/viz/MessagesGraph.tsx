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
} from "@amcharts/amcharts5/xy";

import { useDataProvider } from "@report/DataProvider";
import { MessagesPerCycle } from "@pipeline/aggregate/blocks/MessagesPerCycle";
import { Themes } from "./AmCharts5";

const MessagesGraph = ({ data }: { data: MessagesPerCycle }) => {
    const dataProvider = useDataProvider();
    const chartDiv = useRef<HTMLDivElement>(null);
    const [charts, setCharts] = useState<{
        stepSeries: StepLineSeries | null;
        columnSeries: ColumnSeries | null;
    }>({
        stepSeries: null,
        columnSeries: null,
    });

    useLayoutEffect(() => {
        const root = Root.new(chartDiv.current!);
        root.setThemes(Themes(root, false)); // Do not animate!

        const chartStep = root.container.children.push(
            XYChart.new(root, {
                layout: root.verticalLayout,
            })
        );
        chartStep.zoomOutButton.set("forceHidden", true);
        chartStep.set("cursor", XYCursor.new(root, {}));
        //chartStep.get("cursor")!.lineX.set("visible", false);
        chartStep.get("cursor")!.lineY.set("visible", false);

        const createValueAxis = (chart: XYChart) => {
            return chart.yAxes.push(
                ValueAxis.new(root, {
                    renderer: AxisRendererY.new(root, {
                        inside: false,
                    }),
                    min: 0,
                    maxPrecision: 0,
                })
            );
        };

        const createDateAxis = (chart: XYChart, timeUnit: "day" | "month") => {
            return chart.xAxes.push(
                DateAxis.new(root, {
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
                    renderer: AxisRendererX.new(root, {}),
                })
            );
        };

        const stepSeries = chartStep.series.push(
            StepLineSeries.new(root, {
                valueXField: "d",
                valueYField: "m",
                xAxis: createDateAxis(chartStep, "day"),
                yAxis: createValueAxis(chartStep),
                noRisers: true,
                stroke: Color.fromHex(0x479adb),
                fill: Color.fromHex(0x479adb),
                /*tooltipText: "[bold]{valueX.formatDate('EEEE, MMM dd yyyy')}:[/] {messages} messages sent",
            tooltip: am5.Tooltip.new(root, {
                pointerOrientation: "horizontal",
            })*/
            })
        );

        chartStep.yAxes.getIndex(0)!.children.unshift(
            Label.new(root, {
                rotation: -90,
                text: "Messages sent",
                y: p50,
                centerX: p50,
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
            XYChart.new(root, {
                layout: root.verticalLayout,
                height: 100,
            })
        );
        chartColumn.zoomOutButton.set("forceHidden", true);
        chartColumn.set("cursor", XYCursor.new(root, {}));
        chartColumn.get("cursor")!.lineX.set("visible", false);
        chartColumn.get("cursor")!.lineY.set("visible", false);

        const columnSeries = chartColumn.series.push(
            ColumnSeries.new(root, {
                valueXField: "d",
                valueYField: "m",
                xAxis: createDateAxis(chartColumn, "month"),
                yAxis: createValueAxis(chartColumn),
                fill: Color.fromHex(0x479adb),
                /*tooltipText: "[bold]{valueX.formatDate('MMM yyyy')}:[/] {messages} messages sent",
            tooltip: am5.Tooltip.new(root, {
                pointerOrientation: "horizontal",
            })*/
            })
        );
        chartColumn.yAxes.getIndex(0)!.children.unshift(
            Label.new(root, {
                rotation: -90,
                text: ".....",
                // invisible text to align with the other graph
                opacity: 0,
                y: p50,
                centerX: p50,
            })
        );

        root.container.set("layout", root.verticalLayout);

        const onZoom = () =>
            [chartStep, chartColumn].forEach((c) =>
                (c.xAxes.getIndex(0) as DateAxis<any>).zoomToDates(
                    dataProvider.getActiveStartDate(),
                    dataProvider.getActiveEndDate()
                )
            );

        dataProvider.on("trigger-time", onZoom);
        setCharts({ stepSeries, columnSeries });

        // must wait to datavalidated before zooming
        [stepSeries, columnSeries].forEach((c) => c.events.once("datavalidated", onZoom));

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
                minHeight: 550,
                marginLeft: 5,
                marginBottom: 5,
            }}
        ></div>
    );
};

export default MessagesGraph;
