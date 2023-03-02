import { useLayoutEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

import { Container, Root, Theme, p100 } from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import { enableDebouncedResize } from "@report/components/viz/amcharts/AmCharts5";

export type SetDataFn<Data> = (data: Data) => void;
export type DisposeFn = () => void;
export type CreateFn<Data> = (c: Container) => SetDataFn<Data> | [SetDataFn<Data>, DisposeFn];

interface Props<Data extends any> {
    className?: string;
    style?: React.CSSProperties;
    animated?: true;
    createTheme?: (root: Root) => Theme;
    data: Data | undefined;
    create: CreateFn<Data>;
}

/**
 * Wrapper for AmCharts5 charts, to avoid common boilerplate.
 * Be careful with the `create` function, it will recreate the chart if it changes. You may want to memoize it.
 */
export const AmCharts5Chart = <Data extends any>(props: Props<Data>) => {
    const chartDiv = useRef<HTMLDivElement>(null);
    const rootRef = useRef<Root | undefined>(undefined);
    const setDataRef = useRef<(data: Data) => void>(() => {});

    // track if the chart is in view
    const { inView, ref: inViewRef } = useInView({
        threshold: 0,
        initialInView: false,
        fallbackInView: true,
    });

    // this should be set to true only once and then stay true
    const shouldBeCreated =
        // either the chart is in view
        inView ||
        // or the chart already exists (and we want to keep it that way)
        rootRef.current !== undefined;

    // this deps trigger a chart recreation
    const chartDeps = [shouldBeCreated, props.animated, props.createTheme, props.create] as any[];

    useLayoutEffect(() => {
        if (!shouldBeCreated) return;

        const root = Root.new(chartDiv.current!);
        root.setThemes(
            (
                (props.animated === true
                    ? [am5themes_Dark.new(root), am5themes_Animated.new(root)]
                    : [am5themes_Dark.new(root)]) as Theme[]
            ).concat(props.createTheme ? [props.createTheme(root)] : [])
        );

        const container = root.container.children.push(
            Container.new(root, {
                width: p100,
                height: p100,
                layout: root.verticalLayout,
            })
        );

        const ret = props.create(container);

        let setData: SetDataFn<Data>;
        let cleanup: DisposeFn | undefined;

        if (Array.isArray(ret)) {
            setData = ret[0];
            cleanup = ret[1];
        } else {
            setData = ret;
        }

        rootRef.current = root;
        setDataRef.current = setData;

        const cleanupDebounce = enableDebouncedResize(root);

        return () => {
            if (cleanup) cleanup();
            cleanupDebounce();
            root.dispose();
        };
    }, chartDeps);

    useLayoutEffect(() => {
        if (props.data !== undefined) setDataRef.current(props.data);
    }, chartDeps.concat([props.data]));

    useLayoutEffect(() => {
        // enable ticking only if in view
        if (rootRef.current) {
            rootRef.current.updateTick = inView;

            // ⚠️ make sure to resize the chart when it becomes visible
            // because we debounced the resize and since the chart was not visible, it was not resized
            if (inView) rootRef.current.resize();
        }
    }, chartDeps.concat([inView]));

    return (
        <div ref={inViewRef}>
            <div ref={chartDiv} className={props.className} style={props.style} />
        </div>
    );
};
