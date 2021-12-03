import { useLayoutEffect, useRef } from "react";

import { Root, Color, Percent, Tooltip } from "@amcharts/amcharts5";
import { PieChart, PieSeries } from "@amcharts/amcharts5/percent";

import { Themes } from "./AmCharts5";

interface Props {}

const PieChartGraph = (props: Props) => {
    const chartDiv = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const root = Root.new(chartDiv.current!);
        root.setThemes(Themes(root, true));

        const chart = root.container.children.push(
            PieChart.new(root, {
                layout: root.verticalLayout,
            })
        );

        const series = chart.series.push(
            PieSeries.new(root, {
                name: "Series",
                valueField: "sales",
                categoryField: "country",
                alignLabels: true,
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
            inside: false,
        });
        series.data.setAll([
            {
                country: "Text",
                sales: 78,
                sliceSettings: {
                    fill: Color.fromString("#00bcd4"),
                    stroke: null,
                },
            },
            {
                country: "Media",
                sales: 13,
                sliceSettings: {
                    fill: Color.fromString("#ff9800"),
                    stroke: null,
                },
            },
            {
                country: "Other",
                sales: 3,
                sliceSettings: {
                    fill: Color.fromString("#ccc"),
                    stroke: null,
                },
                // stickers, etc
            },
        ]);

        return () => {
            root.dispose();
        };
    }, []);

    return <div ref={chartDiv} style={{ width: "100%", height: "100%", minHeight: 700 }}></div>;
};

export default PieChartGraph;
