import { Color, Container, Tooltip, p100, percent } from "@amcharts/amcharts5";
import { AxisRendererX } from "@amcharts/amcharts5/xy";
import { MessagesStats, WeekdayHourEntry } from "@pipeline/aggregate/blocks/messages/MessagesStats";
import { useBlockData } from "@report/BlockHook";
import { createYAxisLabel } from "@report/components/viz/amcharts/AmCharts5";
import { AmCharts5Chart } from "@report/components/viz/amcharts/AmCharts5Chart";
import { createBarChart } from "@report/components/viz/amcharts/BarChart";
import { createHeatmap } from "@report/components/viz/amcharts/Heatmap";

const HOURS = [...Array(24).keys()]; // [0, 1, 2, ..., 22, 23]

const MIN_COLOR = Color.fromHex(0xfefa76);
const MAX_COLOR = Color.fromHex(0xfe3527);

const createActivitySplit = (c: Container) => {
    const { series: weekdaySeries, xAxis: weekdayXAxis } = createBarChart(c.root, "weekday", "value");
    const { series: hourSeries, xAxis: hourXAxis } = createBarChart(c.root, "hour", "value");

    // set height to 50%
    weekdaySeries.chart!.set("height", percent(50));

    [weekdaySeries, hourSeries].forEach((s, i) => {
        // rounded corners
        s.columns.template.setAll({
            cornerRadiusTL: 5,
            cornerRadiusTR: 5,
            strokeOpacity: 0,
        });

        // heatmap colors
        s.set("heatRules", [
            {
                target: s.columns.template,
                min: MIN_COLOR,
                max: MAX_COLOR,
                dataField: "valueY",
                key: "fill",
            },
        ]);

        // tooltip
        s.setAll({
            calculateAggregates: true, // needed for heatRules
            tooltip: Tooltip.new(c.root, {
                labelText: `[bold]{categoryX}${i == 0 ? "" : "hs"}[/]: {valueY} messages sent`,
            }),
        });

        s.chart!.xAxes.getIndex(0)!.get("renderer").setAll({
            minGridDistance: 20, // make sure all labels are visible
        });

        createYAxisLabel(s.chart!.yAxes.getIndex(0)!, "Messages sent");
    });

    c.children.push(weekdaySeries.chart!);
    c.children.push(hourSeries.chart!);

    return (data: WeekdayHourEntry[]) => {
        const aggrWeekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((weekday) => ({
            weekday,
            value: data.filter(({ weekday: w }) => w === weekday).reduce((acc, { value }) => acc + value, 0),
        }));
        const aggrHours = HOURS.map((h) => ({
            hour: h,
            value: data.filter(({ hour: hh }) => hh === `${h}hs`).reduce((acc, { value }) => acc + value, 0),
        }));

        weekdaySeries.data.setAll(aggrWeekdays.filter((x) => x.value > 0));
        weekdayXAxis.data.setAll(aggrWeekdays);
        hourSeries.data.setAll(aggrHours.filter((x) => x.value > 0));
        hourXAxis.data.setAll(aggrHours);
    };
};

const createActivityHeatmap = (c: Container) => {
    const { chart, series, xAxis, yAxis } = createHeatmap(c.root, "weekday", "hour", "value", MIN_COLOR, MAX_COLOR);

    (xAxis.get("renderer") as AxisRendererX).setAll({
        minGridDistance: 20, // make sure all weekdays are listed
        opposite: true, // weekdays at the top (labels)
    });
    xAxis.data.setAll([
        { weekday: "Mon" },
        { weekday: "Tue" },
        { weekday: "Wed" },
        { weekday: "Thu" },
        { weekday: "Fri" },
        { weekday: "Sat" },
        { weekday: "Sun" },
    ]);

    yAxis.get("renderer").setAll({
        minGridDistance: 20, // make sure all hours are listed
        inversed: true, // from 0hs to 23hs
    });
    yAxis.data.setAll(
        HOURS.map((h) => ({
            hour: `${h}hs`,
        }))
    );

    series.columns.template.setAll({
        tooltipText: "[bold]{categoryX} at {categoryY}[/]: {value} messages sent",
        stroke: Color.fromHex(0xffffff),
        strokeOpacity: 1,
        strokeWidth: 1,
        width: p100,
        height: p100,
    });

    c.children.push(chart);

    return (data: WeekdayHourEntry[]) => series.data.setAll(data.filter((x) => x.value > 0));
};

export const WeekdayHourActivity = ({ options }: { options: number[] }) => (
    <AmCharts5Chart
        style={{
            minHeight: 617,
            marginLeft: 5,
            marginBottom: 8,
        }}
        data={useBlockData("messages/stats")?.weekdayHourActivity}
        create={options[0] === 0 ? createActivitySplit : createActivityHeatmap}
    />
);
