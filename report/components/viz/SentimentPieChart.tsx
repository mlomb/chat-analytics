import { useLayoutEffect, useRef } from "react";

import { Color, Percent, Root, Tooltip } from "@amcharts/amcharts5";
import { PieChart, PieSeries } from "@amcharts/amcharts5/percent";

import { Themes, enableDebouncedResize } from "./AmCharts5";

interface Props {
    n: number; // -
    p: number; // +
    z: number;
}

const SentimentPieChart = (props: Props) => {
    const chartDiv = useRef<HTMLDivElement>(null);
    const seriesRef = useRef<PieSeries | null>(null);

    useLayoutEffect(() => {
        const root = Root.new(chartDiv.current!);
        root.setThemes(Themes(root, true));
        const cleanupDebounce = enableDebouncedResize(root);

        const chart = root.container.children.push(
            PieChart.new(root, {
                layout: root.verticalLayout,
            })
        );

        const series = chart.series.push(
            PieSeries.new(root, {
                valueField: "count",
                categoryField: "tag",
                alignLabels: false,
                innerRadius: new Percent(50),
                tooltip: Tooltip.new(root, {
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

        seriesRef.current = series;

        return () => {
            seriesRef.current = null;
            cleanupDebounce();
            root.dispose();
        };
    }, []);

    useLayoutEffect(
        () =>
            seriesRef.current?.data.setAll([
                {
                    tag: "Positive",
                    count: props.p,
                    sliceSettings: {
                        fill: seriesRef.current?.root.interfaceColors.get("positive")!,
                        stroke: null,
                    },
                },
                {
                    tag: "Negative",
                    count: props.n,
                    sliceSettings: {
                        fill: seriesRef.current?.root.interfaceColors.get("negative")!,
                        stroke: null,
                    },
                },
                {
                    tag: "Neutral",
                    count: props.z,
                    sliceSettings: {
                        fill: Color.fromString("#00bcd4"),
                        stroke: null,
                    },
                },
            ]),
        [props.n, props.p, props.z]
    );

    return (
        <div
            ref={chartDiv}
            style={{
                minHeight: 477,
                marginLeft: 5,
                marginBottom: 8,
            }}
        ></div>
    );
};

export default SentimentPieChart;
