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

    const downloadCSV = () => {
        if (!data) return;
        const db = getDatabase();

        const maxN = data.nodes.reduce((acc, node) => {
            return Math.max(acc, Math.max(node.f, node.t));
        }, 0);

        let csv = "author1,author2,count\n";

        const escapeName = (name: string) => {
            return name.replace(/,/g, "");
        };

        for (const node of data.nodes) {
            csv += `${escapeName(db.authors[node.f].n)},${escapeName(db.authors[node.t].n)},${node.c}\n`;
        }

        const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const csvURL = window.URL.createObjectURL(csvData);

        console.log(csvURL);

        const link = document.createElement("a");
        link.setAttribute("href", csvURL);
        link.setAttribute("download", "datos.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <>
            <AmCharts5Chart
                data={data}
                create={createParticipationChart}
                style={{
                    minHeight: 619,
                    marginLeft: 5,
                    marginBottom: 8,
                }}
            />
            <button
                onClick={downloadCSV}
                style={{
                    padding: 10,
                    margin: 10,
                    cursor: "pointer",
                }}
            >
                DESCARGAR CSV
            </button>
        </>
    );
};

export default ConversationParticipation;
