import { Color, HeatLegend, Root, p100 } from "@amcharts/amcharts5";
import { AxisRendererX, AxisRendererY, CategoryAxis, ColumnSeries, XYChart } from "@amcharts/amcharts5/xy";

export const createHeatmap = (
    root: Root,
    xField: string,
    yField: string,
    valueField: string,
    startColor: Color,
    endColor: Color
) => {
    const chart = XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
    });

    const xAxis = chart.xAxes.push(
        CategoryAxis.new(root, {
            renderer: AxisRendererX.new(root, {}),
            categoryField: xField,
        })
    );

    const yAxis = chart.yAxes.push(
        CategoryAxis.new(root, {
            renderer: AxisRendererY.new(root, {}),
            categoryField: yField,
        })
    );

    const series = chart.series.push(
        ColumnSeries.new(root, {
            xAxis: xAxis,
            yAxis: yAxis,
            categoryXField: xField,
            categoryYField: yField,
            valueField: valueField,
            calculateAggregates: true,
        })
    );

    series.set("heatRules", [
        {
            target: series.columns.template,
            min: startColor,
            max: endColor,
            dataField: valueField,
            key: "fill",
        },
    ]);

    // add color legend
    const heatLegend = chart.bottomAxesContainer.children.push(
        HeatLegend.new(root, {
            orientation: "horizontal",
            startColor,
            endColor,
        })
    );

    series.columns.template.events.on("pointerover", (event) => {
        const di = event.target.dataItem;
        if (di) {
            // @ts-expect-error
            heatLegend.showValue(di.get("value", 0));
        }
    });

    series.events.on("datavalidated", () => {
        heatLegend.set("startValue", series.getPrivate("valueLow"));
        heatLegend.set("endValue", series.getPrivate("valueHigh"));
    });

    return {
        chart,
        series,
        xAxis,
        yAxis,
    };
};
