import { Color, Container, Legend, Percent, Tooltip } from "@amcharts/amcharts5";
import { PieChart, PieSeries } from "@amcharts/amcharts5/percent";
import { AmCharts5Chart } from "@report/components/viz/amcharts/AmCharts5Chart";

interface Props {
    n: number; // -
    p: number; // +
    z: number;
    u: number;
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
        // disable pull-out
        toggleKey: "none",
    });
    // A large unscored share can leave very small scored slices; use a legend to avoid overlapping labels.
    series.labels.template.set("forceHidden", true);
    series.ticks.template.set("forceHidden", true);
    const legend = chart.children.push(
        Legend.new(c.root, {
            layout: c.root.verticalLayout,
            clickTarget: "none",
            paddingBottom: 24,
        })
    );
    legend.labels.template.set("text", "{category}");
    legend.valueLabels.template.set("text", "{valuePercentTotal.formatNumber('0.0')}%");
    series
        .get("colors")!
        .set("colors", [
            c.root.interfaceColors.get("positive")!,
            c.root.interfaceColors.get("negative")!,
            Color.fromHex(0x00bcd4),
            Color.fromHex(0x9e9e9e),
        ]);

    return (data: Props) => {
        series.data.setAll([
            {
                tag: "Positive",
                count: data.p,
            },
            {
                tag: "Negative",
                count: data.n,
            },
            {
                tag: "Neutral",
                count: data.z,
            },
            {
                tag: "Not scored",
                count: data.u,
            },
        ]);
        legend.data.setAll(series.dataItems);
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
