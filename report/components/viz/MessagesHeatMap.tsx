import { useLayoutEffect, useRef } from "react";

interface Props {
    timeRange: [Date, Date];
}

const MessagesHeatMap = (props: Props) => {
    const chartDiv = useRef<HTMLDivElement>(null);
    /*const chart = useRef<am4charts.XYChart | null>(null);

    useLayoutEffect(() => {
        let x = am4core.create(chartDiv.current!, am4charts.XYChart);


        x.maskBullets = false;

        let xAxis = x.xAxes.push(new am4charts.CategoryAxis());
        let yAxis = x.yAxes.push(new am4charts.CategoryAxis());
        
        xAxis.dataFields.category = "weekday";
        yAxis.dataFields.category = "hour";
        
        xAxis.renderer.grid.template.disabled = true;
        xAxis.renderer.minGridDistance = 40;
        
        yAxis.renderer.grid.template.disabled = true;
        yAxis.renderer.inversed = true;
        yAxis.renderer.minGridDistance = 30;
        
        let series = x.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "weekday";
        series.dataFields.categoryY = "hour";
        series.dataFields.value = "value";
        series.sequencedInterpolation = true;
        series.defaultState.transitionDuration = 3000;
        
        let bgColor = new am4core.InterfaceColorSet().getFor("background");
        
        let columnTemplate = series.columns.template;
        columnTemplate.strokeWidth = 1;
        columnTemplate.strokeOpacity = 0.2;
        columnTemplate.stroke = bgColor;
        columnTemplate.tooltipText = "{weekday}, {hour}: {value.workingValue.formatNumber('#.')}";
        columnTemplate.width = am4core.percent(100);
        columnTemplate.height = am4core.percent(100);
        
        series.heatRules.push({
          target: columnTemplate,
          property: "fill",
          min: am4core.color(bgColor),
          max: x.colors.getIndex(0)
        });
        
        // heat legend
        let heatLegend = x.bottomAxesContainer.createChild(am4charts.HeatLegend);
        heatLegend.width = am4core.percent(100);
        heatLegend.series = series;
        heatLegend.valueAxis.renderer.labels.template.fontSize = 9;
        heatLegend.valueAxis.renderer.minGridDistance = 30;



        chart.current = x;
        return x.dispose;
    }, []);*/

    /*useLayoutEffect(() => {
        chart.current!.data = props.data.per_time_of_week;
    }, [props.data]);*/

    return <div ref={chartDiv} style={{ width: "100%", height: "500px" }}></div>;
};

export default MessagesHeatMap;
