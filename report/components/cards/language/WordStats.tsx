import { useMemo } from "react";

import { Color, Container, Label, Tooltip, p50 } from "@amcharts/amcharts5";
import {
    AxisRendererX,
    AxisRendererY,
    ColumnSeries,
    DateAxis,
    StepLineSeries,
    ValueAxis,
    XYChart,
    XYCursor,
} from "@amcharts/amcharts5/xy";
import { DateItem } from "@pipeline/aggregate/Common";
import { useBlockData } from "@report/BlockHook";
import { getDatabase } from "@report/WorkerWrapper";
import { AuthorLabel } from "@report/components/core/labels/AuthorLabel";
import { ChannelLabel } from "@report/components/core/labels/ChannelLabel";
import AnimatedBars from "@report/components/viz/AnimatedBars";
import { createYAxisLabel, syncAxisWithTimeFilter } from "@report/components/viz/amcharts/AmCharts5";
import { AmCharts5Chart, CreateFn } from "@report/components/viz/amcharts/AmCharts5Chart";

const createChart: CreateFn<DateItem[]> = (c: Container) => {
    const chart = c.children.push(
        XYChart.new(c.root, {
            layout: c.root.verticalLayout,
        })
    );

    chart.children.unshift(
        Label.new(c.root, {
            text: "Usage over time",
            fontSize: 20,
            fontWeight: "500",
            textAlign: "center",
            x: p50,
            centerX: p50,
            paddingTop: 0,
            paddingBottom: 10,
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
        fill: Color.fromHex(0x00ffc5),
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
    const word = wordIndex >= 0 ? getDatabase().words[wordIndex] : "";
    const wordStats = useBlockData("language/word-stats", { wordIndex });
    const maxItems = 4;

    const computed = useMemo(() => {
        if (wordStats === undefined) {
            return {
                authorEntries: [],
                channelEntries: [],
            };
        }

        return {
            authorEntries: wordStats.counts.authors
                .map((value, index) => ({
                    index,
                    value,
                }))
                .filter((a) => a.value > 0) // filter out 0
                .sort((a, b) => b.value - a.value)
                .slice(0, maxItems),
            channelEntries: wordStats.counts.channels
                .map((value, index) => ({
                    index,
                    value,
                }))
                .filter((a) => a.value > 0) // filter out 0
                .sort((a, b) => b.value - a.value)
                .slice(0, maxItems),
        };
    }, [wordStats]);

    return (
        <>
            <h1 className="word-title">{word}</h1>
            <AmCharts5Chart
                create={createChart}
                data={wordStats?.perMonth}
                style={{
                    minHeight: 250,
                    marginLeft: 5,
                    marginBottom: 8,
                }}
            />

            <AnimatedBars
                what="Author"
                unit="# of times written"
                data={computed.authorEntries}
                itemComponent={AuthorLabel}
                maxItems={maxItems}
                colorHue={240}
            />
            <AnimatedBars
                what="Channel"
                unit="# of times written"
                data={computed.channelEntries}
                itemComponent={ChannelLabel}
                maxItems={maxItems}
                colorHue={266}
            />
        </>
    );
};

export default WordStats;
