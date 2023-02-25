import { useCallback } from "react";

import { Color, Tooltip } from "@amcharts/amcharts5";
import {
    AxisRendererX,
    AxisRendererY,
    ColumnSeries,
    DateAxis,
    StepLineSeries,
    ValueAxis,
    XYChart,
    XYCursor,
} from "@amcharts/amcharts5/xy";
import { MessagesPerPeriod } from "@pipeline/aggregate/blocks/messages/MessagesPerPeriod";
import { useBlockData } from "@report/BlockHook";
import { createYAxisLabel, syncAxisWithTimeFilter } from "@report/components/viz/amcharts/AmCharts5";
import { AmCharts5Chart, CreateFn } from "@report/components/viz/amcharts/AmCharts5Chart";

export const MessagesOverTime = ({ options }: { options: number[] }) => {
    const data = useBlockData("messages/per-period");

    const createMessagesChart = useCallback<CreateFn<MessagesPerPeriod>>(
        (c) => {
            const period = ["day", "week", "month"][options[0]] as "day" | "week" | "month";

            const chart = c.children.push(
                XYChart.new(c.root, {
                    layout: c.root.verticalLayout,
                })
            );

            const cursor = chart.set("cursor", XYCursor.new(c.root, {}));
            cursor.lineX.set("visible", false);
            cursor.lineY.set("visible", false);

            const xAxis = chart.xAxes.push(
                DateAxis.new(c.root, {
                    baseInterval: { timeUnit: period, count: 1 },
                    renderer: AxisRendererX.new(c.root, {}),
                })
            );
            const yAxis = chart.yAxes.push(
                ValueAxis.new(c.root, {
                    renderer: AxisRendererY.new(c.root, {}),
                    maxPrecision: 0, // messages are integers
                    min: 0, // always base at 0
                })
            );
            createYAxisLabel(yAxis, "Messages sent");

            const tooltip = Tooltip.new(c.root, {
                labelText: {
                    day: "[bold]{valueX.formatDate('dd MMMM yyyy')}[/]: {valueY} messages sent",
                    week: "[bold]A week of {valueX.formatDate('MMMM yyyy')}[/]: {valueY} messages sent",
                    month: "[bold]{valueX.formatDate('MMMM yyyy')}[/]: {valueY} messages sent",
                }[period],
            });

            const graphType = period === "day" ? "step" : "column";

            let series: ColumnSeries | StepLineSeries;

            // for days
            if (graphType === "step") {
                series = StepLineSeries.new(c.root, {
                    valueXField: "d",
                    valueYField: "m",
                    xAxis: xAxis,
                    yAxis: yAxis,
                    noRisers: true,
                    stroke: Color.fromHex(0x008cff),
                    fill: Color.fromHex(0x008cff),
                    tooltip,
                });
                series.strokes.template.setAll({
                    visible: true,
                    strokeWidth: 3,
                    strokeOpacity: 1,
                });
                series.fills.template.setAll({
                    visible: true,
                    fillOpacity: 0.3,
                });
            } else {
                // for weeks and months
                series = ColumnSeries.new(c.root, {
                    valueXField: "d",
                    valueYField: "m",
                    xAxis: xAxis,
                    yAxis: yAxis,
                    fill: Color.fromHex(0x008cff),
                    tooltip,
                });
                // rounded corners
                series.columns.template.setAll({
                    cornerRadiusTL: 3,
                    cornerRadiusTR: 3,
                    strokeOpacity: 0,
                });
            }

            chart.series.push(series);

            const setData = (data: MessagesPerPeriod) => {
                series.data.setAll(
                    {
                        day: data.perDay,
                        week: data.perWeek,
                        month: data.perMonth,
                    }[period]
                );
                return chart;
            };

            const cleanupAxisSync = syncAxisWithTimeFilter([series], xAxis, yAxis);

            return [setData, cleanupAxisSync];
        },
        [options[0]]
    );

    return (
        <AmCharts5Chart
            data={data}
            create={createMessagesChart}
            style={{
                minHeight: 550,
                marginLeft: 5,
                marginBottom: 8,
            }}
        />
    );
};
