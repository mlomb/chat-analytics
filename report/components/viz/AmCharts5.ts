import { Root, Series } from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import { DateAxis, ValueAxis } from "@amcharts/amcharts5/xy";
import { Filter } from "@pipeline/aggregate/Blocks";
import { getWorker } from "@report/WorkerWrapper";

export const Themes = (root: any, animated: boolean) =>
    animated ? [am5themes_Animated.new(root), am5themes_Dark.new(root)] : [am5themes_Dark.new(root)];

/** Syncs the x-axis with the time filter, so the chart is zoomed to the current time filter. */
export const syncAxisWithTimeFilter = (series: Series[], xAxis: DateAxis<any>, yAxis: ValueAxis<any>) => {
    const worker = getWorker();

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
