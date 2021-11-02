import { useLayoutEffect, useRef } from "react";

import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";

import { dataProvider } from "../DataProvider";
import { Themes } from "./AmCharts5";

interface Props {}

const PieChart = (props: Props) => {
    const chartDiv = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const root = am5.Root.new(chartDiv.current!);
        root.setThemes(Themes(root, true));

        const chart = root.container.children.push(
            am5percent.PieChart.new(root, {
                layout: root.verticalLayout,
            })
        );

        const series = chart.series.push(
            am5percent.PieSeries.new(root, {
                name: "Series",
                valueField: "sales",
                categoryField: "country",
                alignLabels: true,
                innerRadius: new am5.Percent(50),
                tooltip: am5.Tooltip.new(root, {
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
                    fill: am5.color("#00bcd4"),
                    stroke: null,
                },
            },
            {
                country: "Media",
                sales: 13,
                sliceSettings: {
                    fill: am5.color("#ff9800"),
                    stroke: null,
                },
            },
            {
                country: "Other",
                sales: 3,
                sliceSettings: {
                    fill: am5.color("#ccc"),
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

export default PieChart;
