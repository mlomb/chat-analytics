import { useLayoutEffect, useRef } from "react";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { dataProvider } from "../DataProvider";

const MessagesGraph = () => {
    const chartDiv = useRef<HTMLDivElement>(null);
    const chart = useRef<am4charts.XYChart | null>(null);

    useLayoutEffect(() => {
        let x = am4core.create(chartDiv.current!, am4charts.XYChart);

        x.data = dataProvider.getPerDayData();
        x.zoomOutButton.disabled = true;

        let dateAxis = x.xAxes.push(new am4charts.DateAxis());
        let valueAxis = x.yAxes.push(new am4charts.ValueAxis());
        valueAxis.maxPrecision = 0;
        valueAxis.min = 0;

        var series = x.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = "date";
        series.dataFields.valueY = "messages";
        
        const onZoom = () => dateAxis.zoomToDates(dataProvider.getStart(), dataProvider.getEnd(), true, true);
        const onDataUpdated = x.invalidateRawData.bind(x);

        onZoom();

        dataProvider.on('updated-data', onDataUpdated);
        dataProvider.on('updated-zoom', onZoom);

        chart.current = x;
        return () => {
            dataProvider.off('updated-data', onDataUpdated);
            dataProvider.off('updated-zoom', onZoom);
            x.dispose();
        };
    }, []);

    return <div ref={chartDiv} style={{ width: "100%", height: "500px" }}></div>;
};

export default MessagesGraph;
