import { useLayoutEffect, useRef } from "react";

import { Themes } from "./AmCharts5";
import { Root } from "@amcharts/amcharts5";
import { ChordDirected } from "@amcharts/amcharts5/flow";

import { useDataProvider } from "@report/DataProvider";
import { ConversationStats } from "@pipeline/aggregate/blocks/ConversationStats";

const ConversationParticipation = ({ data, options }: { data?: ConversationStats; options: number[] }) => {
    const dataProvider = useDataProvider();
    const chartDiv = useRef<HTMLDivElement>(null);
    const seriesRef = useRef<ChordDirected | null>(null);

    useLayoutEffect(() => {
        const root = Root.new(chartDiv.current!);
        root.setThemes(Themes(root, true));

        const series = root.container.children.push(
            ChordDirected.new(root, {
                sourceIdField: "f",
                targetIdField: "t",
                valueField: "c",
            })
        );
        series.nodes.setAll({
            idField: "id",
            nameField: "name",
        });
        series.nodes.labels.template.setAll({
            textType: "adjusted",
        });
        series.links.template.setAll({
            tooltipText:
                "Conversation that both [bold]{sourceId}[/] and [bold]{targetId}[/] participated: [bold]{value}[/]",
        });
        seriesRef.current = series;

        return () => {
            seriesRef.current = null;
            root.dispose();
        };
    }, []);

    useLayoutEffect(() => {
        if (data) {
            seriesRef.current?.nodes.data.clear();
            seriesRef.current?.data.clear();
            seriesRef.current?.data.setAll(
                data.nodes.map((node) => ({
                    f: dataProvider.database.authors[node.f].n,
                    t: dataProvider.database.authors[node.t].n,
                    c: node.c,
                }))
            );
        }
    }, [data]);

    return (
        <div
            ref={chartDiv}
            style={{
                minHeight: 619,
                marginLeft: 5,
                marginBottom: 8,
            }}
        />
    );
};

export default ConversationParticipation;
