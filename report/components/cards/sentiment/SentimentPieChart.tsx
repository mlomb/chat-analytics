import { Color, Container, Percent, Tooltip } from "@amcharts/amcharts5";
import { PieChart, PieSeries } from "@amcharts/amcharts5/percent";
import { AmCharts5Chart } from "@report/components/viz/amcharts/AmCharts5Chart";

interface Props {
    n: number; // -
    p: number; // +
    z: number;
}

const createPieChart = (c: Container) => {
    const chart = c.root.container.children.push(
        PieChart.new(c.root, {
            layout: c.root.verticalLayout,
        })
    );

    const series = chart.series.push(
        PieSeries.new(c.root, {
            valueField: "count",
            categoryField: "tag",
            alignLabels: false,
            innerRadius: new Percent(50),
            tooltip: Tooltip.new(c.root, {
                forceHidden: true,
            }),
        })
    );
    series.slices.template.setAll({
        templateField: "sliceSettings",
    });
    series.labels.template.setAll({
        textType: "circular",
        centerX: 0,
        centerY: 0,
    });

    return (data: Props) => {
        series.data.setAll([
            {
                tag: "Positive",
                count: data.p,
                sliceSettings: {
                    fill: c.root.interfaceColors.get("positive")!,
                    stroke: null,
                },
            },
            {
                tag: "Negative",
                count: data.n,
                sliceSettings: {
                    fill: c.root.interfaceColors.get("negative")!,
                    stroke: null,
                },
            },
            {
                tag: "Neutral",
                count: data.z,
                sliceSettings: {
                    fill: Color.fromString("#00bcd4"),
                    stroke: null,
                },
            },
        ]);
    };
};

const SentimentPieChart = (props: Props) => {
    return (
        <AmCharts5Chart
            create={createPieChart}
            data={props}
            style={{
                minHeight: 477,
                marginLeft: 5,
                marginBottom: 8,
            }}
        />
    );
};

export default SentimentPieChart;
