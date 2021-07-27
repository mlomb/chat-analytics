import { useLayoutEffect, useRef } from "react";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

import { dataProvider } from "../DataProvider";

const styleScrollbar = (scrollbar: am4charts.XYChartScrollbar) => {
    let series = scrollbar.series.getIndex(0)!;

    const customizeGrip = (grip: am4core.ResizeButton) => {
        grip.icon.disabled = true;
        grip.background.disabled = true;

        var img = grip.createChild(am4core.Rectangle);
        img.width = 15;
        img.height = 15;
        img.fill = am4core.color("#479ADB");
        img.rotation = 45;
        img.align = "center";
        img.valign = "middle";

        var line = grip.createChild(am4core.Rectangle);
        line.height = 60;
        line.width = 3;
        line.fill = am4core.color("#479ADB");
        line.align = "center";
        line.valign = "middle";
    }
    
    customizeGrip(scrollbar.startGrip);
    customizeGrip(scrollbar.endGrip);
};

const TimeSelector = () => {
    const chartDiv = useRef<HTMLDivElement>(null);
    const chart = useRef<am4charts.XYChart | null>(null);

    useLayoutEffect(() => {
        let x = am4core.create(chartDiv.current!, am4charts.XYChart);

        let dateAxis = x.xAxes.push(new am4charts.DateAxis());
        let valueAxis = x.yAxes.push(new am4charts.ValueAxis());
        valueAxis.maxPrecision = 0;
        valueAxis.min = 0;

        let scrollbar = new am4charts.XYChartScrollbar();
        x.scrollbarX = scrollbar;
        
        let series = new am4charts.StepLineSeries();
        series.dataFields.dateX = "date";
        series.dataFields.valueY = "messages";
        series.noRisers = true;
        series.strokeWidth = 2;
        series.fillOpacity = 0.2;
        series.sequencedInterpolation = true;
        
        x.series.push(series);
        scrollbar.series.push(series);

        // hide plot
        x.plotContainer.visible = false;
        x.leftAxesContainer.visible = false;
        x.rightAxesContainer.visible = false;
        x.bottomAxesContainer.visible = false;
        x.chartContainer.visible = false;
        x.chartAndLegendContainer.visible = false;
        // style scrollbar
        styleScrollbar(scrollbar);

        scrollbar.parent = x;
        scrollbar.margin(0, 0, 30, 0);
        x.padding(0,0,0,0);
        x.margin(0,0,0,0);

        const dateAxisChanged = (ev: any) => {
            let start = new Date(ev.target.minZoomed);
            let end = new Date(ev.target.maxZoomed);
            dataProvider.updateTimeRange(start, end);
        };
        dateAxis.events.on("startchanged", dateAxisChanged);
        dateAxis.events.on("endchanged", dateAxisChanged);

        const onDataUpdated = () => scrollbar.scrollbarChart.invalidateRawData();
        dataProvider.on('updated-data', onDataUpdated);

        x.data = dataProvider.getPerDayData();
        
        chart.current = x;
        return () => {
            dataProvider.off('updated-data', onDataUpdated);
            x.dispose();
        };
    }, []);

    return <div ref={chartDiv} style={{ width: "100%", height: "91px" }}></div>;
};

export default TimeSelector;
