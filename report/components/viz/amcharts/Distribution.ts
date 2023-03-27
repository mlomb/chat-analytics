import { Color, Root, percent } from "@amcharts/amcharts5";
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

        // allow zooming
        panX: true,
        wheelY: "zoomX",
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
        quantileSeries.chart?.yAxes.getIndex(0)?.data.setAll([data.boxplot]); // needed for the dummy category to work
        quantileSeries.data.setAll([data.boxplot]);
        medianSeries.data.setAll([data.boxplot]);

        // set histogram data
        const values = [];
        const step = (data.boxplot.whiskerMax - data.boxplot.whiskerMin) / data.count.length;
        let accum = data.boxplot.whiskerMin;

        for (let i = 0; i < data.count.length; i++) {
            values.push({
                value: data.count[i],
                from: accum,
                to: accum + step,
            });
            accum += step;
        }

        histogramSeries.data.setAll(values);
    };

    return {
        chart,
        setData,
        quantileSeries,
        medianSeries,
        histogramSeries,
        xAxis,
        yAxis: chart.yAxes.getIndex(1)! as ValueAxis<any>, // histogram Y-axis
    };
};

const createBoxplot = (root: Root, chart: XYChart, xAxis: Axis<any>) => {
    // Y-axis for the boxplot (dummy, not used)
    const yAxis = chart.yAxes.push(
        CategoryAxis.new(root, {
            categoryField: "q1", // dummy field, must exist
            renderer: AxisRendererY.new(root, {}),

            // top, from top to 20%
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
            xAxis,
            yAxis,
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

            // bottom, from 20% to bottom
            y: percent(20),
            height: percent(80),
        })
    );

    // Histogram series
    const series = chart.series.push(
        ColumnSeries.new(root, {
            xAxis,
            yAxis,
            valueXField: "from",
            openValueXField: "to",
            valueYField: "value",
            fill: Color.fromHex(0xd0db2d),
        })
    );

    series.columns.template.set("strokeOpacity", 0);

    return series;
};
