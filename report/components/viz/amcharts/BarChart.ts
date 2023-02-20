import { Root } from "@amcharts/amcharts5";
import {
    AxisRendererX,
    AxisRendererY,
    CategoryAxis,
    ColumnSeries,
    ValueAxis,
    XYChart,
    XYCursor,
} from "@amcharts/amcharts5/xy";

export const createBarChart = (root: Root, xField: string, yField: string) => {
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
        ValueAxis.new(root, {
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
