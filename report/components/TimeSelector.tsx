import { useEffect, useLayoutEffect, useRef } from "react";

import { Color, Root } from "@amcharts/amcharts5";
import {
    AxisRendererX,
    AxisRendererY,
    DateAxis,
    StepLineSeries,
    ValueAxis,
    XYChart,
    XYChartScrollbar,
} from "@amcharts/amcharts5/xy";
import { useBlockData } from "@report/BlockHook";
import { getWorker } from "@report/WorkerWrapper";
import { LoadingGroup } from "@report/components/LoadingGroup";

import { Themes, enableDebouncedResize } from "./viz/amcharts/AmCharts5";

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

const TimeSelector = () => {
    const data = useBlockData("messages-per-cycle");
    const chartDiv = useRef<HTMLDivElement>(null);
    const seriesRef = useRef<StepLineSeries | null>(null);

    useLayoutEffect(() => {
        const root = Root.new(chartDiv.current!);
        root.setThemes(Themes(root, false));
        const cleanupDebounce = enableDebouncedResize(root);

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
                getWorker().updateTimeRange(start, end);
            }
        };
        scrollbarX.events.on("rangechanged", dateAxisChanged);

        return () => {
            cleanupDebounce();
            root.dispose();
        };
    }, []);

    useEffect(() => {
        if (data) {
            // TODO: update efficient
            seriesRef.current?.data.setAll(data.perDay);
        }
    }, [data, seriesRef]);

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

export default () => <LoadingGroup children={() => <TimeSelector />} />;
