import { useLayoutEffect, useRef } from "react";

import { Themes } from "./AmCharts5";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

import { dataProvider } from "../DataProvider";

const SB_HEIGHT = 50;

const TimeSelector = () => {
    const chartDiv = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const root = am5.Root.new(chartDiv.current!);
        root.setThemes(Themes(root, false));

        const chart = root.container.children.push(
            am5xy.XYChart.new(root, {
                layout: root.verticalLayout,
                paddingBottom: 0,
                paddingTop: 0,
                paddingLeft: 0,
                paddingRight: 0,
                marginBottom: 0,
                marginTop: 0,
                marginLeft: 0,
                marginRight: 0
            })
        );

        const scrollbarX = am5xy.XYChartScrollbar.new(root, {
            orientation: "horizontal",
            height: SB_HEIGHT,
            paddingBottom: 0,
            paddingTop: 0,
            paddingLeft: 0,
            paddingRight: 0,
            marginBottom: 0,
            marginTop: 0,
            marginLeft: 0,
            marginRight: 0,
        });

        scrollbarX.get("background")!.setAll({
            fill: am5.Color.fromHex(0x000000),
            fillOpacity: 0.01
        });
        chart.plotContainer.set("visible", false);
        chart.rightAxesContainer.set("visible", false);
        chart.leftAxesContainer.set("visible", false);
        chart.bottomAxesContainer.set("visible", false);

        chart.set("scrollbarX", scrollbarX);

        const xAxis = scrollbarX.chart.xAxes.push(
            am5xy.DateAxis.new(root, {
                baseInterval: { timeUnit: "day", count: 1 },
                renderer: am5xy.AxisRendererX.new(root, { })
            })
        );

        const yAxis = scrollbarX.chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                renderer: am5xy.AxisRendererY.new(root, {}),
                min: 0,
                maxPrecision: 0
            })
        );

        const series = scrollbarX.chart.series.push(
            am5xy.StepLineSeries.new(root, {
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "messages",
                valueXField: "date",
                noRisers: true
            })
        );

        series.strokes.template.setAll({
            strokeWidth: 2,
            strokeOpacity: 0.5
        });
        series.fills.template.setAll({
            fillOpacity: 0.2,
            visible: true
        });

        const dateAxisChanged = (ev: { start: number, end: number }) => {
            let start = xAxis.positionToDate(ev.start);
            let end = xAxis.positionToDate(ev.end);
            dataProvider.updateTimeRange(start, end);
        };
        scrollbarX.events.on("rangechanged", dateAxisChanged);

        // TODO: update efficient
        const onDataUpdated = () => series.data.setAll(dataProvider.getPerDayData());
        dataProvider.on('updated-data', onDataUpdated);

        return () => {
            dataProvider.off('updated-data', onDataUpdated);
            root.dispose();
        };
    }, []);

    return <div
        ref={chartDiv}
        className="time-selector"
        style={{
            width: "100%",
            height: SB_HEIGHT
        }}
    ></div>;
};

export default TimeSelector;
