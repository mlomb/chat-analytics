import { Root } from "@amcharts/amcharts5";
import {
    AxisRendererX,
    AxisRendererY,
    CategoryAxis,
    ColumnSeries,
    DurationAxis,
    ValueAxis,
    XYChart,
    XYCursor,
} from "@amcharts/amcharts5/xy";
import { AxisType } from "@report/components/viz/amcharts/AmCharts5";

export const createBarChart = (root: Root, xField: string, yField: string, yAxisType: AxisType = "value") => {
    const chart = XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
    });

    // we want to show the tooltip on hover but not show the dashed lines
    const cursor = chart.set("cursor", XYCursor.new(root, {}));
    cursor.lineX.set("visible", false);
    cursor.lineY.set("visible", false);

    const xAxis = chart.xAxes.push(
        CategoryAxis.new(root, {
            renderer: AxisRendererX.new(root, { minGridDistance: 30 }),
            categoryField: xField,
        })
    );

    const yAxis = chart.yAxes.push(
        (yAxisType === "duration" ? DurationAxis : ValueAxis).new(root, {
            renderer: AxisRendererY.new(root, {}),
        })
    );

    const series = chart.series.push(
        ColumnSeries.new(root, {
            xAxis: xAxis,
            yAxis: yAxis,
            categoryXField: xField,
            valueYField: yField,
        })
    );

    return {
        chart,
        series,
        xAxis,
        yAxis,
    };
};
