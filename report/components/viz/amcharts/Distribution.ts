import { Color, Root, Tooltip, percent } from "@amcharts/amcharts5";
import {
    Axis,
    AxisRendererX,
    AxisRendererY,
    CandlestickSeries,
    CategoryAxis,
    ColumnSeries,
    StepLineSeries,
    ValueAxis,
    XYChart,
} from "@amcharts/amcharts5/xy";
import { VariableDistribution } from "@pipeline/aggregate/Common";

export const createHistogramWithBoxplot = (root: Root) => {
    // Chart where we will put the boxplot and the histogram
    const chart = XYChart.new(root, {
        // stack vertically
        layout: root.verticalLayout,
    });

    // X-axis, shared by all series
    const xAxis = chart.xAxes.push(
        ValueAxis.new(root, {
            renderer: AxisRendererX.new(root, {}),
        })
    );

    const { quantileSeries, medianSeries } = createBoxplot(root, chart, xAxis);
    const histogramSeries = createHistogram(root, chart, xAxis);

    const setData = (data: VariableDistribution) => {
        // set boxplot data
        quantileSeries.chart?.yAxes.getIndex(0)?.data.setAll([data.boxplot]);
        quantileSeries.data.setAll([data.boxplot]);
        medianSeries.data.setAll([data.boxplot]);

        // set histogram data
        histogramSeries.data.setAll(
            data.count.map((value, category) => ({
                category,
                value,
            }))
        );
    };

    return {
        chart,
        setData,
    };
};

const createBoxplot = (root: Root, chart: XYChart, xAxis: Axis<any>) => {
    // Y-axis for the boxplot (dummy, not used)
    const yAxis = chart.yAxes.push(
        CategoryAxis.new(root, {
            categoryField: "q1", // dummy field, must exist
            renderer: AxisRendererY.new(root, {}),
            y: 0,
            height: percent(20),
        })
    );

    // hide the dummy label
    yAxis.get("renderer").labels.template.set("visible", false);

    // Quantile series (whiskers and box)
    // Actually it is just a candlestick series with one dummy category in the Y-axis
    const quantileSeries = chart.series.push(
        CandlestickSeries.new(root, {
            xAxis,
            yAxis,
            lowValueXField: "whiskerMin",
            openValueXField: "q1",
            valueXField: "q3",
            highValueXField: "whiskerMax",

            // dummy category, can be set to any field
            categoryYField: "q1",
        })
    );

    // change the color of the box and whiskers
    // (the color of the rising candlestick, since it is the first and only one)
    quantileSeries.columns.template.states.create("riseFromOpen", {
        fill: undefined,
        stroke: Color.fromHex(0xd0db2d),
    });

    // Median series
    // Needed to draw the median line
    const medianSeries = chart.series.push(
        StepLineSeries.new(root, {
            stroke: Color.fromHex(0xd0db2d),
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "median",
            noRisers: true,

            // dummy category, can be set to any field
            categoryYField: "q1",
        })
    );

    return { quantileSeries, medianSeries };
};

const createHistogram = (root: Root, chart: XYChart, xAxis: Axis<any>) => {
    // Y-axis for the histogram
    const yAxis = chart.yAxes.push(
        ValueAxis.new(root, {
            renderer: AxisRendererY.new(root, {}),
        })
    );

    // Histogram series
    const series = chart.series.push(
        ColumnSeries.new(root, {
            xAxis,
            yAxis,
            valueXField: "category",
            valueYField: "value",
            tooltip: Tooltip.new(root, {
                labelText: "{valueY}",
            }),
            fill: Color.fromHex(0xd0db2d),
            stroke: Color.fromHex(0xd0db2d),
        })
    );

    return series;
};
