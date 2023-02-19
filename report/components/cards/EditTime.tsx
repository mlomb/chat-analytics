import { useLayoutEffect, useRef } from "react";

import { Container, Root, Tooltip, p100 } from "@amcharts/amcharts5";
import { XYCursor } from "@amcharts/amcharts5/xy";
import type { VariableDistribution } from "@pipeline/aggregate/Common";
import { MessagesEdited } from "@pipeline/aggregate/blocks/messages/MessagesEdited";
import { createHistogramWithBoxplot } from "@report/components/viz/amcharts/Distribution";

import { Themes, createXAxisLabel, createYAxisLabel, enableDebouncedResize } from "../viz/AmCharts5";

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
        if (data !== undefined) setDataRef.current(data.timeDistribution);
    }, [data]);

    return (
        <div
            ref={chartDiv}
            style={{
                minHeight: 250,
                marginLeft: 5,
                marginBottom: 8,
            }}
        ></div>
    );
};

export default EditTime;
