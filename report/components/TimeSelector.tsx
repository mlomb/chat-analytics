import { useEffect, useLayoutEffect, useRef } from "react";

import { Themes } from "./viz/AmCharts5";
import { Root, Color } from "@amcharts/amcharts5";
import {
    XYChart,
    XYChartScrollbar,
    DateAxis,
    ValueAxis,
    AxisRendererX,
    AxisRendererY,
    StepLineSeries,
} from "@amcharts/amcharts5/xy";

import { useDataProvider } from "@report/DataProvider";
import { BlockInfo } from "@pipeline/aggregate/Blocks";
import Block from "@report/components/Block";

const SB_HEIGHT = 50;
const RESETS = {
    paddingBottom: 0,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginBottom: 0,
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
};

const TimeSelector = (props: { info: BlockInfo<"messages-per-cycle"> }) => {
    const dataProvider = useDataProvider();
    const chartDiv = useRef<HTMLDivElement>(null);
    const seriesRef = useRef<StepLineSeries | null>(null);

    useLayoutEffect(() => {
        const root = Root.new(chartDiv.current!);
        root.setThemes(Themes(root, false));

        const chart = root.container.children.push(
            XYChart.new(root, {
                layout: root.verticalLayout,
                ...RESETS,
            })
        );

        const scrollbarX = XYChartScrollbar.new(root, {
            orientation: "horizontal",
            height: SB_HEIGHT,
            ...RESETS,
        });

        scrollbarX.get("background")!.setAll({
            fill: Color.fromHex(0x1e2529),
            fillOpacity: 0.01,
        });
        chart.plotContainer.set("visible", false);
        chart.rightAxesContainer.set("visible", false);
        chart.leftAxesContainer.set("visible", false);
        chart.bottomAxesContainer.set("visible", false);

        chart.set("scrollbarX", scrollbarX);

        const xAxis = scrollbarX.chart.xAxes.push(
            DateAxis.new(root, {
                baseInterval: { timeUnit: "day", count: 1 },
                renderer: AxisRendererX.new(root, {}),
            })
        );

        const yAxis = scrollbarX.chart.yAxes.push(
            ValueAxis.new(root, {
                renderer: AxisRendererY.new(root, {}),
                min: 0,
                maxPrecision: 0,
            })
        );

        const series = scrollbarX.chart.series.push(
            StepLineSeries.new(root, {
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "m",
                valueXField: "d",
                noRisers: true,
            })
        );

        series.strokes.template.setAll({
            strokeWidth: 2,
            strokeOpacity: 0.5,
        });
        series.fills.template.setAll({
            fillOpacity: 0.2,
            visible: true,
        });
        seriesRef.current = series;

        const dateAxisChanged = (ev: { start: number; end: number }) => {
            let start = xAxis.positionToDate(ev.start);
            let end = xAxis.positionToDate(ev.end);
            if (start > end) [start, end] = [end, start];
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                dataProvider.updateTimeRange(start, end);
            }
        };
        scrollbarX.events.on("rangechanged", dateAxisChanged);

        return () => root.dispose();
    }, []);

    useEffect(() => {
        if (props.info.state === "ready") {
            // TODO: update efficient
            seriesRef.current?.data.setAll(props.info.data!.perDay);
        }
    }, [props.info, seriesRef]);

    return (
        <div
            ref={chartDiv}
            className="TimeSelector"
            style={{
                height: SB_HEIGHT + 1,
            }}
        ></div>
    );
};

export default () => <Block blockKey="messages-per-cycle" children={TimeSelector} />;
