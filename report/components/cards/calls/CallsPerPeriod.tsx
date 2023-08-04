import { useCallback } from "react";

import { Color, DurationFormatter, Tooltip } from "@amcharts/amcharts5";
import {
    AxisRenderer,
    AxisRendererX,
    AxisRendererY,
    ColumnSeries,
    DateAxis,
    DurationAxis,
    IValueAxisSettings,
    StepLineSeries,
    ValueAxis,
    XYChart,
    XYCursor,
} from "@amcharts/amcharts5/xy";
import { CallsPerPeriod } from "@pipeline/aggregate/blocks/calls/CallsPerPeriod";
import { useBlockData } from "@report/BlockHook";
import { createYAxisLabel, syncAxisWithTimeFilter } from "@report/components/viz/amcharts/AmCharts5";
import { AmCharts5Chart, CreateFn } from "@report/components/viz/amcharts/AmCharts5Chart";

const CallsOverTime = ({ options }: { options: number[] }) => {
    const createCallsChart = useCallback<CreateFn<CallsPerPeriod>>(
        (c) => {
            const period = ["day", "week", "month"][options[1]] as "day" | "week" | "month";
            const field = ["t", "n"][options[0]]; // t=total time in seconds, n=number of calls

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

            const yAxisSettings: IValueAxisSettings<AxisRenderer> = {
                renderer: AxisRendererY.new(c.root, {}),
                maxPrecision: 0, // calls are integers
                min: 0, // always base at 0
            };

            let yAxis;
            if (field === "t") {
                yAxis = DurationAxis.new(c.root, {
                    ...yAxisSettings,
                    baseUnit: "second",
                    durationFormatter: DurationFormatter.new(c.root, {
                        //durationFormat: "hh'h' mm 'm' ss's'",
                    }),
                });
            } else {
                yAxis = ValueAxis.new(c.root, yAxisSettings);
            }
            chart.yAxes.push(yAxis);

            createYAxisLabel(yAxis, field === "t" ? "Time spent on calls" : "Calls initiated");

            const tooltipSuffix =
                field === "t" ? "{valueY.formatDuration()} spent on calls" : "{valueY} calls initiated";
            const tooltip = Tooltip.new(c.root, {
                labelText: {
                    day: "[bold]{valueX.formatDate('dd MMMM yyyy')}[/]: " + tooltipSuffix,
                    week: "[bold]A week of {valueX.formatDate('MMMM yyyy')}[/]: " + tooltipSuffix,
                    month: "[bold]{valueX.formatDate('MMMM yyyy')}[/]: " + tooltipSuffix,
                }[period],
            });

            const graphType = period === "day" ? "step" : "column";

            let series: ColumnSeries | StepLineSeries;

            // for days
            if (graphType === "step") {
                series = StepLineSeries.new(c.root, {
                    valueXField: "ts",
                    valueYField: field,
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
                    valueXField: "ts",
                    valueYField: field,
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

            const setData = (data: CallsPerPeriod) => {
                series.data.setAll(
                    {
                        day: data.perDay,
                        week: data.perWeek,
                        month: data.perMonth,
                    }[period]
                );
            };

            const cleanupAxisSync = syncAxisWithTimeFilter([series], xAxis, yAxis);

            return [setData, cleanupAxisSync];
        },
        [options[0], options[1]]
    );

    return (
        <AmCharts5Chart
            create={createCallsChart}
            data={useBlockData("calls/per-period")}
            style={{
                minHeight: 550,
                marginLeft: 5,
                marginBottom: 8,
            }}
        />
    );
};

export default CallsOverTime;
