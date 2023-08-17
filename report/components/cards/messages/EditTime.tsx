import { useBlockData } from "@report/BlockHook";
import DottedTable, { Line } from "@report/components/viz/DottedTable";
import { AmCharts5Chart } from "@report/components/viz/amcharts/AmCharts5Chart";
import { createDistributionChart } from "@report/components/viz/amcharts/Distribution";

const createDistributionChartFn = createDistributionChart({
    tooltipLabel: "[bold]{valueY} messages [/] were edited\n between [bold]{from}-{to} seconds[/] after being sent",
    xAxisType: "value", // better to show seconds than minutes
    xAxisLabel: "Seconds between sending and editing",
    yAxisLabel: "Messages edited",
});

const EditTime = () => {
    const data = useBlockData("messages/edited");

    const lines: Line[] = [
        {
            type: "separator",
        },
        {
            type: "number",
            formatter: "time",
            label: "Median time for editing a message",
            value: data?.editTimeDistribution.boxplot.median,
        },
        {
            type: "number",
            formatter: "time",
            label: "Three out of four messages were edited within",
            value: data?.editTimeDistribution.boxplot.q3,
        },
        {
            type: "number",
            formatter: "time",
            label: "Highest edit time difference",
            value: data?.editTimeDistribution.boxplot.max,
        },
        {
            type: "number",
            formatter: "integer",
            label: "Number of messages edited in less than a second",
            value: data?.editedInLessThan1Second,
        },
        {
            type: "separator",
        },
    ];

    return (
        <>
            <AmCharts5Chart
                create={createDistributionChartFn}
                data={data?.editTimeDistribution}
                style={{
                    minHeight: 250,
                    marginLeft: 5,
                    marginBottom: 8,
                }}
            />

            <DottedTable lines={lines} />

            {/*
            <AnimatedBars
                what="Author"
                unit="Average edit time (seconds)"
                data={bars || []}
                itemComponent={AuthorLabel}
                maxItems={Math.min(5, getDatabase().authors.length)}
                colorHue={240}
            />
            */}
        </>
    );
};

export default EditTime;
