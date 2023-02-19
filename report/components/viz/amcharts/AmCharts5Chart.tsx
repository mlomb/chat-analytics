import { useLayoutEffect, useRef } from "react";

import { Container, Root, p100 } from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import { enableDebouncedResize } from "@report/components/viz/amcharts/AmCharts5";

interface Props<Data extends any> {
    style?: React.CSSProperties;
    animated?: true;
    data: Data | undefined;
    create: (c: Container) => (data: Data) => void;
}

/**
 * Wrapper for AmCharts5 charts, to avoid common boilerplate.
 * Be careful with the `create` function, it will recreate the chart if it changes. You may want to memoize it.
 */
export const AmCharts5Chart = <Data extends any>(props: Props<Data>) => {
    const chartDiv = useRef<HTMLDivElement>(null);
    const setDataRef = useRef<(data: Data) => void>(() => {});

    useLayoutEffect(() => {
        const root = Root.new(chartDiv.current!);
        root.setThemes(
            props.animated === true
                ? [am5themes_Dark.new(root), am5themes_Animated.new(root)]
                : [am5themes_Dark.new(root)]
        );

        const container = root.container.children.push(
            Container.new(root, {
                width: p100,
                height: p100,
                layout: root.verticalLayout,
            })
        );

        setDataRef.current = props.create(container);

        const cleanupDebounce = enableDebouncedResize(root);

        return () => {
            cleanupDebounce();
            root.dispose();
        };
    }, [props.animated, props.create]);

    useLayoutEffect(() => {
        if (props.data !== undefined) setDataRef.current(props.data);
    }, [props.data]);

    return <div ref={chartDiv} style={props.style} />;
};
