import { Container, Tooltip } from "@amcharts/amcharts5";
import { XYCursor } from "@amcharts/amcharts5/xy";
import { MessagesEdited } from "@pipeline/aggregate/blocks/messages/MessagesEdited";
import DottedTable, { Line } from "@report/components/viz/DottedTable";
import { createXAxisLabel, createYAxisLabel } from "@report/components/viz/amcharts/AmCharts5";
import { AmCharts5Chart } from "@report/components/viz/amcharts/AmCharts5Chart";
import { createHistogramWithBoxplot } from "@report/components/viz/amcharts/Distribution";

/*
// test
import { AuthorLabel } from "../core/labels/AuthorLabel";
import AnimatedBars, { AnimatedBarEntry } from "../viz/AnimatedBars";
import MostUsed from "../viz/MostUsed";
*/

const createChart = (c: Container) => {
    const { chart, setData, histogramSeries, xAxis, yAxis } = createHistogramWithBoxplot(c.root);

    histogramSeries.setAll({
        tooltip: Tooltip.new(c.root, {
            labelText:
                "[bold]{valueY} messages [/] were edited\n between [bold]{from}-{to} seconds[/] after being sent",
        }),
    });

    xAxis.setAll({
        min: 0,
        maxPrecision: 0, // integer in axis labels
        numberFormat: "#.#", // 1 decimal in tooltip ↓
        extraTooltipPrecision: 1,
    });
    yAxis.setAll({
        tooltipText: "{value} messages sent",
        min: 0,
        maxPrecision: 0, // integer
    });

    createXAxisLabel(xAxis, "Seconds between sending and editing");
    createYAxisLabel(yAxis, "Messages edited");

    const cursor = chart.set("cursor", XYCursor.new(c.root, {}));
    cursor.lineY.set("visible", false);

    c.children.push(chart);

    return setData;
};

const EditTime = ({ data }: { data?: MessagesEdited }) => {
    const lines: Line[] = [
        {
            type: "separator",
        },
        {
            type: "number",
            formatter: "time",
            label: "Median time for editing a message",
            value: data?.editTimeDistribution.boxplot.median,
        },
        {
            type: "number",
            formatter: "time",
            label: "Three out of four messages were edited within",
            value: data?.editTimeDistribution.boxplot.q3,
        },
        {
            type: "number",
            formatter: "time",
            label: "Highest edit time difference",
            value: data?.editTimeDistribution.boxplot.max,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Number of messages edited in less than a second",
            value: data?.editedInLessThan1Second,
        },
        {
            type: "separator",
        },
    ];

    /*
    // test
    const bars: AnimatedBarEntry[] =
        data?.count.authors
            .map((author, i) => ({
                index: i,
                value: 8000 - author,
            }))
            .slice(0, 5) || [];
    */

    return (
        <>
            <AmCharts5Chart
                create={createChart}
                data={data?.editTimeDistribution}
                style={{
                    minHeight: 250,
                    marginLeft: 5,
                    marginBottom: 8,
                }}
            />

            <DottedTable lines={lines} />

            {/*
            <AnimatedBars
                what="Author"
                unit="Average edit time (seconds)"
                data={bars || []}
                itemComponent={AuthorLabel}
                maxItems={Math.min(5, getDatabase().authors.length)}
                colorHue={240}
            />
            */}
        </>
    );
};

export default EditTime;
