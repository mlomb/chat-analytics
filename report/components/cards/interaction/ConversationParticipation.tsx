import { Container } from "@amcharts/amcharts5";
import { ChordDirected } from "@amcharts/amcharts5/flow";
import { ConversationStats } from "@pipeline/aggregate/blocks/interaction/ConversationStats";
import { useBlockData } from "@report/BlockHook";
import { getDatabase } from "@report/WorkerWrapper";
import { AmCharts5Chart } from "@report/components/viz/amcharts/AmCharts5Chart";

const createParticipationChart = (c: Container) => {
    const db = getDatabase();

    const series = c.root.container.children.push(
        ChordDirected.new(c.root, {
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

    return (data: ConversationStats) => {
        series.nodes.data.clear();
        series.data.clear();
        series.data.setAll(
            data.nodes.map((node) => ({
                f: db.authors[node.f].n,
                t: db.authors[node.t].n,
                c: node.c,
            }))
        );
    };
};

const ConversationParticipation = () => {
    const data = useBlockData("interaction/conversation-stats");

    return (
        <AmCharts5Chart
            data={data}
            create={createParticipationChart}
            style={{
                minHeight: 619,
                marginLeft: 5,
                marginBottom: 8,
            }}
        />
    );
};

export default ConversationParticipation;
