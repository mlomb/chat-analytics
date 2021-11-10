import { useLayoutEffect, useRef } from "react";

import { Themes } from "./AmCharts5";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

import { dataProvider } from "@report/DataProvider";

interface Props {}

const HeatMapChart = (props: Props) => {
    const chartDiv = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const root = am5.Root.new(chartDiv.current!);
        root.setThemes(Themes(root, true));

        const chart = root.container.children.push(
            am5xy.XYChart.new(root, {
                panX: false,
                panY: false,
                wheelX: "none",
                wheelY: "none",
                layout: root.verticalLayout,
            })
        );

        // Create axes and their renderers
        var yRenderer = am5xy.AxisRendererY.new(root, {
            visible: false,
            minGridDistance: 20,
            inversed: true,
        });

        yRenderer.grid.template.set("visible", false);

        var yAxis = chart.yAxes.push(
            am5xy.CategoryAxis.new(root, {
                maxDeviation: 0,
                renderer: yRenderer,
                categoryField: "weekday",
            })
        );

        var xRenderer = am5xy.AxisRendererX.new(root, {
            visible: false,
            minGridDistance: 30,
            opposite: true,
        });

        xRenderer.grid.template.set("visible", false);

        var xAxis = chart.xAxes.push(
            am5xy.CategoryAxis.new(root, {
                renderer: xRenderer,
                categoryField: "hour",
            })
        );

        // Create series
        // https://www.amcharts.com/docs/v5/charts/xy-chart/#Adding_series
        var series = chart.series.push(
            am5xy.ColumnSeries.new(root, {
                calculateAggregates: true,
                stroke: am5.color(0xffffff),
                clustered: false,
                xAxis: xAxis,
                yAxis: yAxis,
                categoryXField: "hour",
                categoryYField: "weekday",
                valueField: "value",
            })
        );

        series.columns.template.setAll({
            tooltipText: "{value}",
            strokeOpacity: 1,
            strokeWidth: 2,
            width: am5.percent(100),
            height: am5.percent(100),
        });

        series.columns.template.events.on("pointerover", function (event) {
            var di = event.target.dataItem;
            if (di) {
                // @ts-ignore
                heatLegend.showValue(di.get("value", 0));
            }
        });

        series.events.on("datavalidated", function () {
            heatLegend.set("startValue", series.getPrivate("valueHigh"));
            heatLegend.set("endValue", series.getPrivate("valueLow"));
        });

        // Set up heat rules
        // https://www.amcharts.com/docs/v5/concepts/settings/heat-rules/
        series.set("heatRules", [
            {
                target: series.columns.template,
                min: am5.color(0xfffb77),
                max: am5.color(0xfe131a),
                dataField: "value",
                key: "fill",
            },
        ]);

        // Add heat legend
        // https://www.amcharts.com/docs/v5/concepts/legend/heat-legend/
        var heatLegend = chart.bottomAxesContainer.children.push(
            am5.HeatLegend.new(root, {
                orientation: "horizontal",
                endColor: am5.color(0xfffb77),
                startColor: am5.color(0xfe131a),
            })
        );

        // Set data
        // https://www.amcharts.com/docs/v5/charts/xy-chart/#Setting_data
        var data = [
            {
                hour: "12pm",
                weekday: "Sunday",
                value: 2990,
            },
            {
                hour: "1am",
                weekday: "Sunday",
                value: 2520,
            },
            {
                hour: "2am",
                weekday: "Sunday",
                value: 2334,
            },
            {
                hour: "3am",
                weekday: "Sunday",
                value: 2230,
            },
            {
                hour: "4am",
                weekday: "Sunday",
                value: 2325,
            },
            {
                hour: "5am",
                weekday: "Sunday",
                value: 2019,
            },
            {
                hour: "6am",
                weekday: "Sunday",
                value: 2128,
            },
            {
                hour: "7am",
                weekday: "Sunday",
                value: 2246,
            },
            {
                hour: "8am",
                weekday: "Sunday",
                value: 2421,
            },
            {
                hour: "9am",
                weekday: "Sunday",
                value: 2788,
            },
            {
                hour: "10am",
                weekday: "Sunday",
                value: 2959,
            },
            {
                hour: "11am",
                weekday: "Sunday",
                value: 3018,
            },
            {
                hour: "12am",
                weekday: "Sunday",
                value: 3154,
            },
            {
                hour: "1pm",
                weekday: "Sunday",
                value: 3172,
            },
            {
                hour: "2pm",
                weekday: "Sunday",
                value: 3368,
            },
            {
                hour: "3pm",
                weekday: "Sunday",
                value: 3464,
            },
            {
                hour: "4pm",
                weekday: "Sunday",
                value: 3746,
            },
            {
                hour: "5pm",
                weekday: "Sunday",
                value: 3656,
            },
            {
                hour: "6pm",
                weekday: "Sunday",
                value: 3336,
            },
            {
                hour: "7pm",
                weekday: "Sunday",
                value: 3292,
            },
            {
                hour: "8pm",
                weekday: "Sunday",
                value: 3269,
            },
            {
                hour: "9pm",
                weekday: "Sunday",
                value: 3300,
            },
            {
                hour: "10pm",
                weekday: "Sunday",
                value: 3403,
            },
            {
                hour: "11pm",
                weekday: "Sunday",
                value: 3323,
            },
            {
                hour: "12pm",
                weekday: "Monday",
                value: 3346,
            },
            {
                hour: "1am",
                weekday: "Monday",
                value: 2725,
            },
            {
                hour: "2am",
                weekday: "Monday",
                value: 3052,
            },
            {
                hour: "3am",
                weekday: "Monday",
                value: 3876,
            },
            {
                hour: "4am",
                weekday: "Monday",
                value: 4453,
            },
            {
                hour: "5am",
                weekday: "Monday",
                value: 3972,
            },
            {
                hour: "6am",
                weekday: "Monday",
                value: 4644,
            },
            {
                hour: "7am",
                weekday: "Monday",
                value: 5715,
            },
            {
                hour: "8am",
                weekday: "Monday",
                value: 7080,
            },
            {
                hour: "9am",
                weekday: "Monday",
                value: 8022,
            },
            {
                hour: "10am",
                weekday: "Monday",
                value: 8446,
            },
            {
                hour: "11am",
                weekday: "Monday",
                value: 9313,
            },
            {
                hour: "12am",
                weekday: "Monday",
                value: 9011,
            },
            {
                hour: "1pm",
                weekday: "Monday",
                value: 8508,
            },
            {
                hour: "2pm",
                weekday: "Monday",
                value: 8515,
            },
            {
                hour: "3pm",
                weekday: "Monday",
                value: 8399,
            },
            {
                hour: "4pm",
                weekday: "Monday",
                value: 8649,
            },
            {
                hour: "5pm",
                weekday: "Monday",
                value: 7869,
            },
            {
                hour: "6pm",
                weekday: "Monday",
                value: 6933,
            },
            {
                hour: "7pm",
                weekday: "Monday",
                value: 5969,
            },
            {
                hour: "8pm",
                weekday: "Monday",
                value: 5552,
            },
            {
                hour: "9pm",
                weekday: "Monday",
                value: 5434,
            },
            {
                hour: "10pm",
                weekday: "Monday",
                value: 5070,
            },
            {
                hour: "11pm",
                weekday: "Monday",
                value: 4851,
            },
            {
                hour: "12pm",
                weekday: "Tuesday",
                value: 4468,
            },
            {
                hour: "1am",
                weekday: "Tuesday",
                value: 3306,
            },
            {
                hour: "2am",
                weekday: "Tuesday",
                value: 3906,
            },
            {
                hour: "3am",
                weekday: "Tuesday",
                value: 4413,
            },
            {
                hour: "4am",
                weekday: "Tuesday",
                value: 4726,
            },
            {
                hour: "5am",
                weekday: "Tuesday",
                value: 4584,
            },
            {
                hour: "6am",
                weekday: "Tuesday",
                value: 5717,
            },
            {
                hour: "7am",
                weekday: "Tuesday",
                value: 6504,
            },
            {
                hour: "8am",
                weekday: "Tuesday",
                value: 8104,
            },
            {
                hour: "9am",
                weekday: "Tuesday",
                value: 8813,
            },
            {
                hour: "10am",
                weekday: "Tuesday",
                value: 9278,
            },
            {
                hour: "11am",
                weekday: "Tuesday",
                value: 10425,
            },
            {
                hour: "12am",
                weekday: "Tuesday",
                value: 10137,
            },
            {
                hour: "1pm",
                weekday: "Tuesday",
                value: 9290,
            },
            {
                hour: "2pm",
                weekday: "Tuesday",
                value: 9255,
            },
            {
                hour: "3pm",
                weekday: "Tuesday",
                value: 9614,
            },
            {
                hour: "4pm",
                weekday: "Tuesday",
                value: 9713,
            },
            {
                hour: "5pm",
                weekday: "Tuesday",
                value: 9667,
            },
            {
                hour: "6pm",
                weekday: "Tuesday",
                value: 8774,
            },
            {
                hour: "7pm",
                weekday: "Tuesday",
                value: 8649,
            },
            {
                hour: "8pm",
                weekday: "Tuesday",
                value: 9937,
            },
            {
                hour: "9pm",
                weekday: "Tuesday",
                value: 10286,
            },
            {
                hour: "10pm",
                weekday: "Tuesday",
                value: 9175,
            },
            {
                hour: "11pm",
                weekday: "Tuesday",
                value: 8581,
            },
            {
                hour: "12pm",
                weekday: "Wednesday",
                value: 8145,
            },
            {
                hour: "1am",
                weekday: "Wednesday",
                value: 7177,
            },
            {
                hour: "2am",
                weekday: "Wednesday",
                value: 5657,
            },
            {
                hour: "3am",
                weekday: "Wednesday",
                value: 6802,
            },
            {
                hour: "4am",
                weekday: "Wednesday",
                value: 8159,
            },
            {
                hour: "5am",
                weekday: "Wednesday",
                value: 8449,
            },
            {
                hour: "6am",
                weekday: "Wednesday",
                value: 9453,
            },
            {
                hour: "7am",
                weekday: "Wednesday",
                value: 9947,
            },
            {
                hour: "8am",
                weekday: "Wednesday",
                value: 11471,
            },
            {
                hour: "9am",
                weekday: "Wednesday",
                value: 12492,
            },
            {
                hour: "10am",
                weekday: "Wednesday",
                value: 9388,
            },
            {
                hour: "11am",
                weekday: "Wednesday",
                value: 9928,
            },
            {
                hour: "12am",
                weekday: "Wednesday",
                value: 9644,
            },
            {
                hour: "1pm",
                weekday: "Wednesday",
                value: 9034,
            },
            {
                hour: "2pm",
                weekday: "Wednesday",
                value: 8964,
            },
            {
                hour: "3pm",
                weekday: "Wednesday",
                value: 9069,
            },
            {
                hour: "4pm",
                weekday: "Wednesday",
                value: 8898,
            },
            {
                hour: "5pm",
                weekday: "Wednesday",
                value: 8322,
            },
            {
                hour: "6pm",
                weekday: "Wednesday",
                value: 6909,
            },
            {
                hour: "7pm",
                weekday: "Wednesday",
                value: 5810,
            },
            {
                hour: "8pm",
                weekday: "Wednesday",
                value: 5151,
            },
            {
                hour: "9pm",
                weekday: "Wednesday",
                value: 4911,
            },
            {
                hour: "10pm",
                weekday: "Wednesday",
                value: 4487,
            },
            {
                hour: "11pm",
                weekday: "Wednesday",
                value: 4118,
            },
            {
                hour: "12pm",
                weekday: "Thursday",
                value: 3689,
            },
            {
                hour: "1am",
                weekday: "Thursday",
                value: 3081,
            },
            {
                hour: "2am",
                weekday: "Thursday",
                value: 6525,
            },
            {
                hour: "3am",
                weekday: "Thursday",
                value: 6228,
            },
            {
                hour: "4am",
                weekday: "Thursday",
                value: 6917,
            },
            {
                hour: "5am",
                weekday: "Thursday",
                value: 6568,
            },
            {
                hour: "6am",
                weekday: "Thursday",
                value: 6405,
            },
            {
                hour: "7am",
                weekday: "Thursday",
                value: 8106,
            },
            {
                hour: "8am",
                weekday: "Thursday",
                value: 8542,
            },
            {
                hour: "9am",
                weekday: "Thursday",
                value: 8501,
            },
            {
                hour: "10am",
                weekday: "Thursday",
                value: 8802,
            },
            {
                hour: "11am",
                weekday: "Thursday",
                value: 9420,
            },
            {
                hour: "12am",
                weekday: "Thursday",
                value: 8966,
            },
            {
                hour: "1pm",
                weekday: "Thursday",
                value: 8135,
            },
            {
                hour: "2pm",
                weekday: "Thursday",
                value: 8224,
            },
            {
                hour: "3pm",
                weekday: "Thursday",
                value: 8387,
            },
            {
                hour: "4pm",
                weekday: "Thursday",
                value: 8218,
            },
            {
                hour: "5pm",
                weekday: "Thursday",
                value: 7641,
            },
            {
                hour: "6pm",
                weekday: "Thursday",
                value: 6469,
            },
            {
                hour: "7pm",
                weekday: "Thursday",
                value: 5441,
            },
            {
                hour: "8pm",
                weekday: "Thursday",
                value: 4952,
            },
            {
                hour: "9pm",
                weekday: "Thursday",
                value: 4643,
            },
            {
                hour: "10pm",
                weekday: "Thursday",
                value: 4393,
            },
            {
                hour: "11pm",
                weekday: "Thursday",
                value: 4017,
            },
            {
                hour: "12pm",
                weekday: "Friday",
                value: 4022,
            },
            {
                hour: "1am",
                weekday: "Friday",
                value: 3063,
            },
            {
                hour: "2am",
                weekday: "Friday",
                value: 3638,
            },
            {
                hour: "3am",
                weekday: "Friday",
                value: 3968,
            },
            {
                hour: "4am",
                weekday: "Friday",
                value: 4070,
            },
            {
                hour: "5am",
                weekday: "Friday",
                value: 4019,
            },
            {
                hour: "6am",
                weekday: "Friday",
                value: 4548,
            },
            {
                hour: "7am",
                weekday: "Friday",
                value: 5465,
            },
            {
                hour: "8am",
                weekday: "Friday",
                value: 6909,
            },
            {
                hour: "9am",
                weekday: "Friday",
                value: 7706,
            },
            {
                hour: "10am",
                weekday: "Friday",
                value: 7867,
            },
            {
                hour: "11am",
                weekday: "Friday",
                value: 8615,
            },
            {
                hour: "12am",
                weekday: "Friday",
                value: 8218,
            },
            {
                hour: "1pm",
                weekday: "Friday",
                value: 7604,
            },
            {
                hour: "2pm",
                weekday: "Friday",
                value: 7429,
            },
            {
                hour: "3pm",
                weekday: "Friday",
                value: 7488,
            },
            {
                hour: "4pm",
                weekday: "Friday",
                value: 7493,
            },
            {
                hour: "5pm",
                weekday: "Friday",
                value: 6998,
            },
            {
                hour: "6pm",
                weekday: "Friday",
                value: 5941,
            },
            {
                hour: "7pm",
                weekday: "Friday",
                value: 5068,
            },
            {
                hour: "8pm",
                weekday: "Friday",
                value: 4636,
            },
            {
                hour: "9pm",
                weekday: "Friday",
                value: 4241,
            },
            {
                hour: "10pm",
                weekday: "Friday",
                value: 3858,
            },
            {
                hour: "11pm",
                weekday: "Friday",
                value: 3833,
            },
            {
                hour: "12pm",
                weekday: "Saturday",
                value: 3503,
            },
            {
                hour: "1am",
                weekday: "Saturday",
                value: 2842,
            },
            {
                hour: "2am",
                weekday: "Saturday",
                value: 2808,
            },
            {
                hour: "3am",
                weekday: "Saturday",
                value: 2399,
            },
            {
                hour: "4am",
                weekday: "Saturday",
                value: 2280,
            },
            {
                hour: "5am",
                weekday: "Saturday",
                value: 2139,
            },
            {
                hour: "6am",
                weekday: "Saturday",
                value: 2527,
            },
            {
                hour: "7am",
                weekday: "Saturday",
                value: 2940,
            },
            {
                hour: "8am",
                weekday: "Saturday",
                value: 3066,
            },
            {
                hour: "9am",
                weekday: "Saturday",
                value: 3494,
            },
            {
                hour: "10am",
                weekday: "Saturday",
                value: 3287,
            },
            {
                hour: "11am",
                weekday: "Saturday",
                value: 3416,
            },
            {
                hour: "12am",
                weekday: "Saturday",
                value: 3432,
            },
            {
                hour: "1pm",
                weekday: "Saturday",
                value: 3523,
            },
            {
                hour: "2pm",
                weekday: "Saturday",
                value: 3542,
            },
            {
                hour: "3pm",
                weekday: "Saturday",
                value: 3347,
            },
            {
                hour: "4pm",
                weekday: "Saturday",
                value: 3292,
            },
            {
                hour: "5pm",
                weekday: "Saturday",
                value: 3416,
            },
            {
                hour: "6pm",
                weekday: "Saturday",
                value: 3131,
            },
            {
                hour: "7pm",
                weekday: "Saturday",
                value: 3057,
            },
            {
                hour: "8pm",
                weekday: "Saturday",
                value: 3227,
            },
            {
                hour: "9pm",
                weekday: "Saturday",
                value: 3060,
            },
            {
                hour: "10pm",
                weekday: "Saturday",
                value: 2855,
            },
            {
                hour: "11pm",
                weekday: "Saturday",
                value: 2625,
            },
        ];

        series.data.setAll(data);

        yAxis.data.setAll([
            { weekday: "Sunday" },
            { weekday: "Monday" },
            { weekday: "Tuesday" },
            { weekday: "Wednesday" },
            { weekday: "Thursday" },
            { weekday: "Friday" },
            { weekday: "Saturday" },
        ]);

        xAxis.data.setAll([
            { hour: "12pm" },
            { hour: "1am" },
            { hour: "2am" },
            { hour: "3am" },
            { hour: "4am" },
            { hour: "5am" },
            { hour: "6am" },
            { hour: "7am" },
            { hour: "8am" },
            { hour: "9am" },
            { hour: "10am" },
            { hour: "11am" },
            { hour: "12am" },
            { hour: "1pm" },
            { hour: "2pm" },
            { hour: "3pm" },
            { hour: "4pm" },
            { hour: "5pm" },
            { hour: "6pm" },
            { hour: "7pm" },
            { hour: "8pm" },
            { hour: "9pm" },
            { hour: "10pm" },
            { hour: "11pm" },
        ]);

        return () => {
            root.dispose();
        };
    }, []);

    return <div ref={chartDiv} style={{ width: "100%" /*, height: "100%"*/, minHeight: 700 }}></div>;
};

export default HeatMapChart;
