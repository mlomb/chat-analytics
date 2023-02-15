import { useEffect, useRef } from "react";

import { Color, Container, HeatLegend, Label, Percent, Root, Tooltip, p50, p100, percent } from "@amcharts/amcharts5";
import {
    AxisRendererX,
    AxisRendererY,
    CategoryAxis,
    ColumnSeries,
    ValueAxis,
    XYChart,
    XYCursor,
} from "@amcharts/amcharts5/xy";
import { MessagesStats } from "@pipeline/aggregate/blocks/MessagesStats";

import { Themes, enableDebouncedResize } from "./AmCharts5";

const MIN_COLOR = Color.fromHex(0xfefa76);
const MAX_COLOR = Color.fromHex(0xfe3527);

function createBarChart(root: Root, container: Container, xField: string) {
    const chart = container.children.push(
        XYChart.new(root, {
            panX: false,
            panY: false,
            wheelX: "none",
            wheelY: "none",
        })
    );
    const cursor = chart.set("cursor", XYCursor.new(root, {}));
    cursor.lineX.set("visible", false);
    cursor.lineY.set("visible", false);

    const xAxis = chart.xAxes.push(
        CategoryAxis.new(root, {
            renderer: AxisRendererX.new(root, { minGridDistance: 30 }),
            categoryField: xField,
        })
    );

    const yAxis = chart.yAxes.push(
        ValueAxis.new(root, {
            renderer: AxisRendererY.new(root, {}),
        })
    );
    yAxis.children.unshift(
        Label.new(root, {
            rotation: -90,
            text: "Messages sent",
            y: p50,
            centerX: p50,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            marginTop: 0,
            paddingBottom: 5,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
        })
    );

    const series = chart.series.push(
        ColumnSeries.new(root, {
            xAxis: xAxis,
            yAxis: yAxis,
            categoryXField: xField,
            valueYField: "value",
            valueField: "value",
            calculateAggregates: true,
            tooltip: Tooltip.new(root, {
                labelText: "[bold]{categoryX}:[/] {valueY} messages sent",
            }),
        })
    );
    series.columns.template.setAll({
        cornerRadiusTL: 5,
        cornerRadiusTR: 5,
        strokeOpacity: 0,
    });

    series.set("heatRules", [
        {
            target: series.columns.template,
            min: MIN_COLOR,
            max: MAX_COLOR,
            dataField: "value",
            key: "fill",
        },
    ]);

    return {
        series,
        xAxis,
        yAxis,
    };
}

function createHeatmap(root: Root, container: Container, xField: string, yField: string) {
    const chart = root.container.children.push(
        XYChart.new(root, {
            panX: false,
            panY: false,
            wheelX: "none",
            wheelY: "none",
        })
    );

    const yRenderer = AxisRendererY.new(root, {
        visible: false,
        minGridDistance: 20,
        inversed: true,
    });
    yRenderer.grid.template.set("visible", false);

    const yAxis = chart.yAxes.push(
        CategoryAxis.new(root, {
            maxDeviation: 0,
            renderer: yRenderer,
            categoryField: yField,
        })
    );

    const xRenderer = AxisRendererX.new(root, {
        visible: false,
        minGridDistance: 30,
        opposite: true,
    });

    xRenderer.grid.template.set("visible", false);

    const xAxis = chart.xAxes.push(
        CategoryAxis.new(root, {
            renderer: xRenderer,
            categoryField: xField,
        })
    );

    const series = chart.series.push(
        ColumnSeries.new(root, {
            calculateAggregates: true,
            stroke: Color.fromHex(0xffffff),
            clustered: false,
            xAxis: xAxis,
            yAxis: yAxis,
            categoryXField: xField,
            categoryYField: yField,
            valueField: "value",
        })
    );

    series.columns.template.setAll({
        tooltipText: "{value} messages sent",
        strokeOpacity: 1,
        strokeWidth: 2,
        width: new Percent(100),
        height: new Percent(100),
    });

    series.columns.template.events.on("pointerover", (event) => {
        const di = event.target.dataItem;
        if (di) {
            // @ts-ignore
            heatLegend.showValue(di.get("value", 0));
        }
    });

    series.events.on("datavalidated", () => {
        heatLegend.set("startValue", series.getPrivate("valueHigh"));
        heatLegend.set("endValue", series.getPrivate("valueLow"));
    });

    series.set("heatRules", [
        {
            target: series.columns.template,
            min: MIN_COLOR,
            max: MAX_COLOR,
            dataField: "value",
            key: "fill",
        },
    ]);

    const heatLegend = chart.bottomAxesContainer.children.push(
        HeatLegend.new(root, {
            orientation: "horizontal",
            startColor: MAX_COLOR,
            endColor: MIN_COLOR,
        })
    );

    xAxis.data.setAll([
        { weekday: "Mon" },
        { weekday: "Tue" },
        { weekday: "Wed" },
        { weekday: "Thu" },
        { weekday: "Fri" },
        { weekday: "Sat" },
        { weekday: "Sun" },
    ]);

    yAxis.data.setAll(
        new Array(24).fill(0).map((_, h) => ({
            hour: `${h}hs`,
        }))
    );

    return {
        series,
        xAxis,
        yAxis,
    };
}

const MessageActivity = ({ data, options }: { data?: MessagesStats; options: number[] }) => {
    const chartDiv = useRef<HTMLDivElement>(null);
    const seriesRef = useRef<ColumnSeries[]>([]);
    const xAxisRef = useRef<CategoryAxis<any>[]>([]);

    useEffect(() => {
        const root = Root.new(chartDiv.current!);
        root.setThemes(Themes(root, false));
        const cleanupDebounce = enableDebouncedResize(root);

        const container = root.container.children.push(
            Container.new(root, {
                width: p100,
                height: p100,
                layout: root.verticalLayout,
            })
        );

        if (options[0] === 0) {
            {
                const { series, xAxis } = createBarChart(root, container, "weekday");
                seriesRef.current.push(series);
                xAxisRef.current.push(xAxis);
                series.chart?.set("height", percent(50));
            }
            {
                const { series, xAxis } = createBarChart(root, container, "hour");
                seriesRef.current.push(series);
                xAxisRef.current.push(xAxis);
            }
        } else {
            const { series, xAxis } = createHeatmap(root, container, "weekday", "hour");
            seriesRef.current = [series];
            xAxisRef.current = [xAxis];
        }

        return () => {
            seriesRef.current = [];
            xAxisRef.current = [];
            cleanupDebounce();
            root.dispose();
        };
    }, [options[0]]);

    useEffect(() => {
        if (!data) return;

        if (options[0] === 0) {
            const aggrWeekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((weekday) => ({
                weekday,
                value: data.activity
                    .filter(({ weekday: w }) => w === weekday)
                    .reduce((acc, { value }) => acc + value, 0),
            }));
            const aggrHours = [...Array(24).keys()].map((h) => ({
                hour: h,
                value: data.activity
                    .filter(({ hour: hh }) => hh === `${h}hs`)
                    .reduce((acc, { value }) => acc + value, 0),
            }));

            seriesRef.current[1].data.setAll(aggrHours.filter((x) => x.value > 0));
            xAxisRef.current[1].data.setAll(aggrHours);
            seriesRef.current[0].data.setAll(aggrWeekdays.filter((x) => x.value > 0));
            xAxisRef.current[0].data.setAll(aggrWeekdays);
        } else {
            seriesRef.current[0].data.setAll(data.activity.filter((x) => x.value > 0));
        }
    }, [options[0], data]);

    return (
        <div
            ref={chartDiv}
            style={{
                minHeight: 617,
                marginLeft: 5,
                marginBottom: 8,
            }}
        />
    );
};

export default MessageActivity;
