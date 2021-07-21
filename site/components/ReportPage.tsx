import { Report } from "../../analyzer/Analyzer";

import Header from "./Header";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

import { useLayoutEffect, useRef } from "react";
import FilterSelect from "./FilterSelect";

am4core.useTheme(am4themes_animated);

function Selector() {
  const chart = useRef(null);

  useLayoutEffect(() => {
    let x = am4core.create("chartdiv", am4charts.XYChart);

    let data = [];
    let visits = 10000;

    for (let i = 1; i < 366; i++) {
      visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
      data.push({ date: new Date(2018, 0, i), name: "name" + i, value: visits });
    }

    x.data = data;
    
    // Create axes
    var dateAxis = x.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;

    var valueAxis = x.yAxes.push(new am4charts.ValueAxis());

    // Create series
    var series = x.series.push(new am4charts.LineSeries());
    series.dataFields.dateX = "date";
    series.dataFields.valueY = "value";

    let sb = new am4charts.XYChartScrollbar();
    sb.series.push(series);
    x.scrollbarX = sb;

    x.plotContainer.visible = false;
    x.leftAxesContainer.visible = false;
    x.rightAxesContainer.visible = false;
    x.bottomAxesContainer.visible = false;

    x.padding(0,0,0,0);
    x.margin(0,0,0,0);

    // @ts-ignore
    chart.current = x;

    return () => {
      x.dispose();
    };
  }, []);

  return (
    <div id="chartdiv" style={{ width: "100%", height: "60px" }}></div>
  );
}

interface Props {
    report: Report
};

const ReportPage = ({ report }: Props) => {
    console.log("report", report);
    return <>
        <Header></Header>
        <h1>{report.title} (reporte WIP)</h1>

        <FilterSelect options={report.channels} allText="All channels" placeholder="Select channels..." />
        <FilterSelect options={report.authors} allText="All users" placeholder="Select users..." />

        <Selector/>

        <h2>Messages</h2>
        {/*<Messages />*/}
    </>;
};


export default ReportPage;
