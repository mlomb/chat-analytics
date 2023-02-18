import { useLayoutEffect, useRef } from "react";

import { Container, Root, p100 } from "@amcharts/amcharts5";
import type { VariableDistribution } from "@pipeline/aggregate/Common";
import { MessagesEdited } from "@pipeline/aggregate/blocks/messages/MessagesEdited";
import { createHistogramWithBoxplot } from "@report/components/viz/amcharts/Distribution";

import { Themes, enableDebouncedResize } from "../viz/AmCharts5";

const EditTime = ({ data }: { data?: MessagesEdited }) => {
    const chartDiv = useRef<HTMLDivElement>(null);
    const setDataRef = useRef<(data: VariableDistribution) => void>(() => {});

    useLayoutEffect(() => {
        const root = Root.new(chartDiv.current!);
        root.setThemes(Themes(root, true));
        const cleanupDebounce = enableDebouncedResize(root);

        const container = root.container.children.push(
            Container.new(root, {
                width: p100,
                height: p100,
                layout: root.verticalLayout,
            })
        );

        const { chart, setData } = createHistogramWithBoxplot(root);
        container.children.push(chart);
        setDataRef.current = setData;

        return () => {
            cleanupDebounce();
            root.dispose();
        };
    }, []);

    useLayoutEffect(() => {
        if (data !== undefined) setDataRef.current(data.timeDistribution);
    }, [data]);

    return (
        <div
            ref={chartDiv}
            style={{
                minHeight: 250,
                marginLeft: 5,
                marginBottom: 8,
            }}
        ></div>
    );
};

export default EditTime;
