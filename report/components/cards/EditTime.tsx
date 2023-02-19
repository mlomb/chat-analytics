import { useLayoutEffect, useRef } from "react";

import { Container, Root, Tooltip, p100 } from "@amcharts/amcharts5";
import { XYCursor } from "@amcharts/amcharts5/xy";
import type { VariableDistribution } from "@pipeline/aggregate/Common";
import { MessagesEdited } from "@pipeline/aggregate/blocks/messages/MessagesEdited";
import { Themes, createXAxisLabel, createYAxisLabel, enableDebouncedResize } from "@report/components/viz/AmCharts5";
import DottedTable, { Line } from "@report/components/viz/DottedTable";
import { createHistogramWithBoxplot } from "@report/components/viz/amcharts/Distribution";

/*
// test
import { AuthorLabel } from "../core/labels/AuthorLabel";
import AnimatedBars, { AnimatedBarEntry } from "../viz/AnimatedBars";
import MostUsed from "../viz/MostUsed";
*/

const EditTime = ({ data }: { data?: MessagesEdited }) => {
    const chartDiv = useRef<HTMLDivElement>(null);
    const setDataRef = useRef<(data: VariableDistribution) => void>(() => {});

    useLayoutEffect(() => {
        const root = Root.new(chartDiv.current!);
        root.setThemes(Themes(root, true));
        const cleanupDebounce = enableDebouncedResize(root);

        const container = root.container.children.push(
            Container.new(root, {
                width: p100,
                height: p100,
                layout: root.verticalLayout,
            })
        );

        const { chart, setData, histogramSeries, xAxis, yAxis } = createHistogramWithBoxplot(root);

        histogramSeries.setAll({
            tooltip: Tooltip.new(root, {
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

        const cursor = chart.set("cursor", XYCursor.new(root, {}));
        cursor.lineY.set("visible", false);

        container.children.push(chart);
        setDataRef.current = setData;

        return () => {
            cleanupDebounce();
            root.dispose();
        };
    }, []);

    useLayoutEffect(() => {
        if (data !== undefined) setDataRef.current(data.editTimeDistribution);
    }, [data]);

    const lines: Line[] = [
        {
            type: "separator",
        },
        {
            type: "number",
            formatter: "seconds-or-time",
            label: "Median time for editing a message",
            value: data?.editTimeDistribution.boxplot.median,
        },
        {
            type: "number",
            formatter: "seconds-or-time",
            label: "Three out of four messages were edited within",
            value: data?.editTimeDistribution.boxplot.q3,
        },
        {
            type: "number",
            formatter: "seconds-or-time",
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
            <div
                ref={chartDiv}
                style={{
                    minHeight: 250,
                    marginLeft: 5,
                    marginBottom: 8,
                }}
            ></div>

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
