import { useLayoutEffect, useRef } from "react";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

import { dataProvider } from "../DataProvider";

const TimeSelector = () => {
    const chartDiv = useRef<HTMLDivElement>(null);
    const chart = useRef<am4charts.XYChart | null>(null);

    useLayoutEffect(() => {
        let x = am4core.create(chartDiv.current!, am4charts.XYChart);

        let dateAxis = x.xAxes.push(new am4charts.DateAxis());
        let valueAxis = x.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;

        // preview series
        var series = x.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = "date";
        series.dataFields.valueY = "messages";

        let sb = new am4charts.XYChartScrollbar();
        sb.series.push(series);
        x.scrollbarX = sb;

        x.plotContainer.visible = false;
        x.leftAxesContainer.visible = false;
        x.rightAxesContainer.visible = false;
        x.bottomAxesContainer.visible = false;

        x.padding(0,0,0,0);
        x.margin(0,0,0,0);

        const dateAxisChanged = (ev: any) => {
            let start = new Date(ev.target.minZoomed);
            let end = new Date(ev.target.maxZoomed);
            dataProvider.updateTimeRange(start, end);
        };
        dateAxis.events.on("startchanged", dateAxisChanged);
        dateAxis.events.on("endchanged", dateAxisChanged);

        x.data = dataProvider.getPerDayData();

        const onDataUpdated = () => {
            x.invalidate();
        };
        dataProvider.on('updated-data', onDataUpdated);

        chart.current = x;
        return () => {
            dataProvider.off('updated-data', onDataUpdated);
            x.dispose();
        };
    }, []);

    return <div ref={chartDiv} style={{ width: "100%", height: "85px" }}></div>;
};

export default TimeSelector;
