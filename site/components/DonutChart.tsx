import { useLayoutEffect, useRef } from "react";

import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";

import { dataProvider } from "../DataProvider";
import { Themes } from "./AmCharts5";

interface Props {
};

const DonutChart = (props: Props) => {
    const chartDiv = useRef<HTMLDivElement>(null);
    
    useLayoutEffect(() => {
        const root = am5.Root.new(chartDiv.current!);
        root.setThemes(Themes(root, true));

        const chart = root.container.children.push(am5percent.PieChart.new(root, {
            layout: root.verticalLayout,
        }));

        const series = chart.series.push(am5percent.PieSeries.new(root, {
            name: "Series",
            valueField: "sales",
            categoryField: "country",
            alignLabels: true,
            innerRadius: new am5.Percent(50),
            tooltip: am5.Tooltip.new(root, {
                forceHidden: true
            })
        }));
        series.labels.template.setAll({
            textType: "circular",
            inside: false
        });
        series.data.setAll([{
            country: "Spanish",
            sales: 84
        }, {
            country: "English",
            sales: 13
        }, {
            country: "Unknown",
            sales: 5
        }, {
            country: "Other",
            sales: 3
        }]);
        
        return () => {
            root.dispose();
        };
    }, []);

    return <div ref={chartDiv} style={{ width: "100%", height: "100%", minHeight: 700 }}></div>;
};

export default DonutChart;
