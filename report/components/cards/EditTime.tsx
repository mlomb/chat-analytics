import { useLayoutEffect, useRef } from "react";

import { Root, Tooltip } from "@amcharts/amcharts5";
import { AxisRendererX, AxisRendererY, CategoryAxis, ColumnSeries, ValueAxis, XYChart } from "@amcharts/amcharts5/xy";
import { MessagesEdited } from "@pipeline/aggregate/blocks/messages/MessagesEdited";

import { Themes, enableDebouncedResize } from "../viz/AmCharts5";

const EditTime = ({ data }: { data?: MessagesEdited }) => {
    const chartDiv = useRef<HTMLDivElement>(null);
    const seriesRef = useRef<ColumnSeries | null>(null);

    useLayoutEffect(() => {
        const root = Root.new(chartDiv.current!);
        root.setThemes(Themes(root, true));
        const cleanupDebounce = enableDebouncedResize(root);

        const chart = root.container.children.push(
            XYChart.new(root, {
                layout: root.verticalLayout,
            })
        );

        const xAxis = chart.xAxes.push(
            CategoryAxis.new(root, {
                categoryField: "second",
                renderer: AxisRendererX.new(root, {}),
            })
        );
        const yAxis = chart.yAxes.push(
            ValueAxis.new(root, {
                renderer: AxisRendererY.new(root, {}),
            })
        );

        const series = chart.series.push(
            ColumnSeries.new(root, {
                xAxis,
                yAxis,
                categoryXField: "second",
                valueYField: "edits",
                tooltip: Tooltip.new(root, {
                    labelText: "{valueY}",
                }),
            })
        );

        seriesRef.current = series;

        return () => {
            seriesRef.current = null;
            cleanupDebounce();
            root.dispose();
        };
    }, []);

    useLayoutEffect(() => {
        if (data === undefined) return;

        const chartData = data.timeDistribution.count.map((edits, second) => ({
            second,
            edits,
        }));

        seriesRef.current!.chart!.xAxes.getIndex(0)!.data.setAll(chartData);
        seriesRef.current!.data.setAll(chartData);

        seriesRef.current!.appear(1000);
        seriesRef.current!.chart!.appear(1000, 100);
    }, [data]);

    return (
        <div
            ref={chartDiv}
            style={{
                minHeight: 200,
                marginLeft: 5,
                marginBottom: 8,
            }}
        ></div>
    );
};

export default EditTime;
