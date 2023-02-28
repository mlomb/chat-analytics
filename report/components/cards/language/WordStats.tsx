import { Container, DataItem } from "@amcharts/amcharts5";
import { Color, Tooltip } from "@amcharts/amcharts5";
import { XYChart } from "@amcharts/amcharts5/xy";
import {
    AxisRendererX,
    AxisRendererY,
    ColumnSeries,
    DateAxis,
    StepLineSeries,
    ValueAxis,
    XYCursor,
} from "@amcharts/amcharts5/xy";
import { DateItem } from "@pipeline/aggregate/Common";
import { MessagesPerPeriod } from "@pipeline/aggregate/blocks/messages/MessagesPerPeriod";
import { useBlockData } from "@report/BlockHook";
import { getDatabase } from "@report/WorkerWrapper";
import { AuthorLabel } from "@report/components/core/labels/AuthorLabel";
import { ChannelLabel } from "@report/components/core/labels/ChannelLabel";
import AnimatedBars, { AnimatedBarEntry } from "@report/components/viz/AnimatedBars";
import { createYAxisLabel } from "@report/components/viz/amcharts/AmCharts5";
import { syncAxisWithTimeFilter } from "@report/components/viz/amcharts/AmCharts5";
import { AmCharts5Chart, CreateFn } from "@report/components/viz/amcharts/AmCharts5Chart";

const createChart: CreateFn<DateItem[]> = (c: Container) => {
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
            baseInterval: { timeUnit: "month", count: 1 },
            renderer: AxisRendererX.new(c.root, {}),
        })
    );
    const yAxis = chart.yAxes.push(
        ValueAxis.new(c.root, {
            renderer: AxisRendererY.new(c.root, {}),
            maxPrecision: 0, // integers
            min: 0, // always base at 0
        })
    );
    createYAxisLabel(yAxis, "Number of times written");

    const tooltip = Tooltip.new(c.root, {
        labelText: "[bold]{valueX.formatDate('MMMM yyyy')}[/]: {valueY} times written",
    });

    let series: ColumnSeries | StepLineSeries;

    series = ColumnSeries.new(c.root, {
        valueXField: "ts",
        valueYField: "v",
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

    chart.series.push(series);

    const setData = (data: DateItem[]) => {
        series.data.setAll(data);
    };

    const cleanupAxisSync = syncAxisWithTimeFilter([series], xAxis, yAxis);

    return [setData, cleanupAxisSync];
};

const WordStats = ({ wordIndex }: { wordIndex: number }) => {
    const word = getDatabase().words[wordIndex];
    const wordStats = useBlockData("language/word-stats", { wordIndex });

    let authorEntries: AnimatedBarEntry[] = [];
    let channelEntries: AnimatedBarEntry[] = [];

    if (wordStats) {
        authorEntries = wordStats.counts.authors
            .map((value, index) => ({
                index,
                value,
            }))
            .filter((a) => a.value > 0) // filter out 0
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        channelEntries = wordStats.counts.channels
            .map((value, index) => ({
                index,
                value,
            }))
            .filter((a) => a.value > 0) // filter out 0
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }

    return (
        <>
            <h1>"{word}"</h1>
            <h2>word stats</h2>
            <AmCharts5Chart
                create={createChart}
                data={wordStats?.perMonth}
                style={{
                    minHeight: 500,
                    marginLeft: 5,
                    marginBottom: 8,
                }}
            />

            <AnimatedBars
                what="Author"
                unit="# of times written"
                data={authorEntries}
                itemComponent={AuthorLabel}
                maxItems={5}
                colorHue={240}
            />
            <AnimatedBars
                what="Channel"
                unit="# of times written"
                data={channelEntries}
                itemComponent={ChannelLabel}
                maxItems={5}
                colorHue={266}
            />
        </>
    );
};

export default WordStats;
