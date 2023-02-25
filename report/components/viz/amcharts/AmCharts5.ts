import { Label, Root, Series, p50 } from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import { Axis, DateAxis, ValueAxis } from "@amcharts/amcharts5/xy";
import { Filter } from "@pipeline/aggregate/Blocks";
import { getWorker } from "@report/WorkerWrapper";

export const Themes = (root: any, animated: boolean) =>
    animated ? [am5themes_Animated.new(root), am5themes_Dark.new(root)] : [am5themes_Dark.new(root)];

/** Syncs the X-axis with the time filter, so the chart is zoomed to the current time filter. */
export const syncAxisWithTimeFilter = (series: Series[], xAxis: DateAxis<any>, yAxis: ValueAxis<any>) => {
    const worker = getWorker();

    // since we are syncing the axis, we don't want the zoom out button
    xAxis.chart?.zoomOutButton.set("forceHidden", true);

    const onZoom = () => xAxis.zoomToDates(worker.getActiveStartDate(), worker.getActiveEndDate(), 0);
    const onFilterChange = (filter: Filter) => {
        if (filter === "time") onZoom();
    };

    worker.on("filter-change", onFilterChange);

    series.forEach((s) => {
        // must wait for datavalidated before zooming
        s.events.once("datavalidated", onZoom);
        // See: https://github.com/amcharts/amcharts5/issues/236
        s.events.on("datavalidated", () => yAxis.zoom(0, 1));
    });

    return () => {
        worker.off("filter-change", onFilterChange);
    };
};

/** Makes the chart resize operation debounced. */
export const enableDebouncedResize = (root: Root, waitTime = 150) => {
    // Temporary disable debounce, charts are not resizing when out of view (expected). Not sure how to fix cleanly.
    return () => {};

    root.autoResize = false;

    let timeoutID: ReturnType<typeof setTimeout>;

    const onResize = () => {
        if (timeoutID) clearTimeout(timeoutID);
        timeoutID = setTimeout(() => {
            root.resize();
        }, waitTime);
    };

    window.addEventListener("resize", onResize);

    return () => {
        window.removeEventListener("resize", onResize);
    };
};

/** Creates and positions a label on the X-axis. */
export const createXAxisLabel = (axis: Axis<any>, text: string) => {
    axis.children.push(
        Label.new(axis.root, {
            text,
            x: p50,
            centerX: p50,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            marginTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
        })
    );
};

/** Creates and positions a label on the Y-axis. */
export const createYAxisLabel = (axis: Axis<any>, text: string) => {
    axis.children.unshift(
        Label.new(axis.root, {
            rotation: -90,
            text,
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
};
