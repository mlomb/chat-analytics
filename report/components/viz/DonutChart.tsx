import { useLayoutEffect, useRef } from "react";

import { Root, Percent, Tooltip } from "@amcharts/amcharts5";
import { PieChart, PieSeries } from "@amcharts/amcharts5/percent";

import { Themes } from "./AmCharts5";

interface Props {}

const DonutChart = (props: Props) => {
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
        series.labels.template.setAll({
            textType: "circular",
            inside: false,
        });
        series.data.setAll([
            {
                country: "Spanish",
                sales: 84,
            },
            {
                country: "English",
                sales: 13,
            },
            {
                country: "Unknown",
                sales: 5,
            },
            {
                country: "Other",
                sales: 3,
            },
        ]);

        return () => {
            root.dispose();
        };
    }, []);

    return <div ref={chartDiv} style={{ width: "100%", height: "100%", minHeight: 700 }}></div>;
};

export default DonutChart;
