import { useCallback } from "react";

import { Color, Container, Tooltip } from "@amcharts/amcharts5";
import {
    AxisRendererX,
    AxisRendererY,
    ColumnSeries,
    DateAxis,
    ValueAxis,
    XYChart,
    XYCursor,
} from "@amcharts/amcharts5/xy";
import { SentimentInDate, SentimentPerPeriod } from "@pipeline/aggregate/blocks/sentiment/SentimentPerPeriod";
import { useBlockData } from "@report/BlockHook";
import { syncAxisWithTimeFilter } from "@report/components/viz/amcharts/AmCharts5";
import { AmCharts5Chart, CreateFn } from "@report/components/viz/amcharts/AmCharts5Chart";

const SentimentOverTime = ({ options }: { options: number[] }) => {
    const createSentimentChart = useCallback<CreateFn<SentimentPerPeriod>>(
        (c: Container) => {
            const chart = c.root.container.children.push(
                XYChart.new(c.root, {
                    layout: c.root.verticalLayout,
                })
            );

            const cursor = chart.set("cursor", XYCursor.new(c.root, {}));
            cursor.lineX.set("visible", false);
            cursor.lineY.set("visible", false);

            const xAxis = chart.xAxes.push(
                DateAxis.new(c.root, {
                    baseInterval: { timeUnit: options[0] === 0 ? "week" : "month", count: 1 },
                    renderer: AxisRendererX.new(c.root, {}),
                })
            );
            const yAxis = chart.yAxes.push(
                ValueAxis.new(c.root, {
                    renderer: AxisRendererY.new(c.root, {}),
                })
            );
            yAxis.setAll(
                options[1] === 0
                    ? {
                          min: -100,
                          max: 100,
                          numberFormat: "#s'%'",
                      }
                    : {
                          min: undefined,
                          max: undefined,
                          numberFormat: "#s",
                      }
            );

            const series: ColumnSeries[] = [];

            function createSeries(field: keyof SentimentInDate, color: Color) {
                series.push(
                    chart.series.push(
                        ColumnSeries.new(c.root, {
                            xAxis: xAxis,
                            yAxis: yAxis,
                            valueXField: "t",
                            valueYField: field,
                            fill: color,
                            stacked: true,
                            tooltip: Tooltip.new(c.root, {}),
                        })
                    )
                );
            }

            createSeries("p", c.root.interfaceColors.get("positive")!); // positive messages
            createSeries("n", c.root.interfaceColors.get("negative")!); // negative messages

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

            const cleanupAxisSync = syncAxisWithTimeFilter(series, xAxis, yAxis);

            const setData = (data: SentimentPerPeriod) => {
                series.forEach((s) => s.data.setAll([data.perWeek, data.perMonth][options[0]]));
            };

            return [setData, cleanupAxisSync];
        },
        [options[0], options[1]]
    );

    return (
        <AmCharts5Chart
            create={createSentimentChart}
            data={useBlockData("sentiment/per-period")}
            style={{
                minHeight: 550,
                marginLeft: 5,
                marginBottom: 8,
            }}
        />
    );
};

export default SentimentOverTime;
