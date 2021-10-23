import { useLayoutEffect, useRef } from "react";

import { Themes } from "./AmCharts5";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

import { dataProvider } from "../DataProvider";

const TimeSelector = () => {
    const chartDiv = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const root = am5.Root.new(chartDiv.current!);
        root.setThemes(Themes(root));


        var chart = root.container.children.push(
            am5xy.XYChart.new(root, {
              layout: root.verticalLayout,
              paddingBottom: 0,
              paddingTop: 0,
              paddingLeft: 0,
              paddingRight: 0,
              marginBottom: 0,
              marginTop: 0,
              marginLeft: 0,
              marginRight: 0,
            }),
          );
          
          var scrollbarX = am5xy.XYChartScrollbar.new(root, {
            orientation: "horizontal",
            height: 50,
            paddingBottom: 0,
            paddingTop: 0,
            paddingLeft: 0,
            paddingRight: 0,
            marginBottom: 0,
            marginTop: 0,
            marginLeft: 0,
            marginRight: 0,
          });
          
          chart.plotContainer.set("visible", false);
          chart.rightAxesContainer.set("visible", false);
          chart.leftAxesContainer.set("visible", false);
          chart.bottomAxesContainer.set("visible", false);
          
          chart.set("scrollbarX", scrollbarX);
          
          var sbxAxis = scrollbarX.chart.xAxes.push(
            am5xy.DateAxis.new(root, {
              baseInterval: { timeUnit: "day", count: 1 },
              renderer: am5xy.AxisRendererX.new(root, { })
            })
          );
          
          var sbyAxis = scrollbarX.chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
              renderer: am5xy.AxisRendererY.new(root, {}),
              min: 0,
              maxPrecision: 0,
            })
          );
          
          var sbseries = scrollbarX.chart.series.push(
            am5xy.StepLineSeries.new(root, {
              xAxis: sbxAxis,
              yAxis: sbyAxis,
              valueYField: "messages",
              valueXField: "date",
              noRisers: true,
              
            })
          );
          sbseries.strokes.template.setAll({
            strokeWidth: 2,
            strokeOpacity: 0.5,
          });
          sbseries.fills.template.setAll({
            fillOpacity: 0.2,
            visible: true
          });

            const onDataUpdated = () => sbseries.data.setAll(dataProvider.getPerDayData());
            dataProvider.on('updated-data', onDataUpdated);

            return () => {
                dataProvider.off('updated-data', onDataUpdated);
                root.dispose();
            };
          
    }, []);

    return <div ref={chartDiv} style={{ width: "100%", height: 91, imageRendering: "pixelated" }}></div>;
};

export default TimeSelector;
