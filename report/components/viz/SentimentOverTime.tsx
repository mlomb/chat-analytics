import { useLayoutEffect, useRef } from "react";

import { Color, Root, Tooltip } from "@amcharts/amcharts5";
import {
    AxisRendererX,
    AxisRendererY,
    ColumnSeries,
    DateAxis,
    ValueAxis,
    XYChart,
    XYCursor,
} from "@amcharts/amcharts5/xy";
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
                baseInterval: { timeUnit: "week", count: 1 },
                renderer: AxisRendererX.new(root, {}),
            })
        );
        const yAxis = chart.yAxes.push(
            ValueAxis.new(root, {
                renderer: AxisRendererY.new(root, {}),
            })
        );

        function createSeries(field: keyof SentimentInDate, color: Color) {
            let series = chart.series.push(
                ColumnSeries.new(root, {
                    xAxis: xAxis,
                    yAxis: yAxis,
                    valueXField: "t",
                    valueYField: field,
                    fill: color,
                    stacked: true,
                    tooltip: Tooltip.new(root, {}),
                })
            );

            seriesRef.current.push(series);
        }

        createSeries("p", root.interfaceColors.get("positive")!); // positive messages
        createSeries("n", root.interfaceColors.get("negative")!); // negative messages

        xAxisRef.current = xAxis;
        yAxisRef.current = yAxis;

        // handle zoom
        const onZoom = () => xAxis.zoomToDates(dataProvider.getActiveStartDate(), dataProvider.getActiveEndDate(), 0);
        dataProvider.on("trigger-time", onZoom);
        // must wait to datavalidated before zooming
        seriesRef.current.forEach((c) => {
            c.events.once("datavalidated", onZoom);
            // See: https://github.com/amcharts/amcharts5/issues/236
            c.events.on("datavalidated", () => yAxis.zoom(0, 1));
        });

        return () => {
            dataProvider.off("trigger-time", onZoom);
            root.dispose();
            xAxisRef.current = null;
            yAxisRef.current = null;
            seriesRef.current = [];
        };
    }, []);

    useLayoutEffect(() => {
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
                series[0].set("valueYField", "percP");
                series[1].set("valueYField", "percN");
                series[0].get("tooltip")!.set("labelText", "{valueY}% positive messages sent");
                series[1].get("tooltip")!.set("labelText", "{valueY}% negative messages sent");
            } else if (options[1] === 1) {
                series[0].set("valueYField", "p");
                series[1].set("valueYField", "n");
                series[0].get("tooltip")!.set("labelText", "{valueY} positive messages sent");
                series[1].get("tooltip")!.set("labelText", "{valueY} negative messages sent");
            } else if (options[1] === 2) {
                series[0].set("valueYField", "diffP");
                series[1].set("valueYField", "diffN");
                series[0].get("tooltip")!.set("labelText", "{valueY} more positive messages than negative sent");
                series[1].get("tooltip")!.set("labelText", "{valueY} more negative messages than positive sent");
            }
            if (data) {
                series.forEach((s) => s.data.setAll([data.perWeek, data.perMonth][options[0]]));
            }
        }
    }, [data, options]);

    return (
        <div
            ref={chartDiv}
            style={{
                minHeight: 550,
                marginLeft: 5,
                marginBottom: 8,
            }}
        ></div>
    );
};

export default SentimentOverTime;
