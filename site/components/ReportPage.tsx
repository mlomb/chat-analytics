import { useLayoutEffect, useMemo, useState } from "react";

import { NewAuthor, NewChannel, NewReport } from "../../analyzer/Analyzer";
import { dataProvider, DataProvider } from "../DataProvider";
import Header from "./Header";
import Card from "./Card";
import FilterSelect from "./FilterSelect";
import TimeSelector from "./TimeSelector";
import MessagesGraph from "./MessagesGraph";
import MessagesHeatMap from "./MessagesHeatMap";
import WordCloudGraph from "./WordCloudGraph";
import DonutChart from "./DonutChart";
import PieChart from "./PieChart";
import SimpleTable from "./SimpleTable";
import HeatMapChart from "./HeatMapChart";

const TabContainer = (props: {
    currentValue: string;
    value: string;
    children: React.ReactNode;
}) => {
    return <div style={{ display: props.currentValue === props.value ? "block" : "none" }}>
        {props.children}
    </div>;
};

const Title = ({ children }: any) => <div className="card-title">{children}</div>;

const ReportPage = () => {
    const report = dataProvider.getSource();

    const [selectedChannels, setSelectedChannels] = useState<NewChannel[]>([...report.channels]);
    const [selectedUsers, setSelectedUsers] = useState<NewAuthor[]>([...report.authors]);
    const [tab, setTab] = useState("messages");

    // let data = useMemo(()=> dataProvider.(selectedChannels, selectedUsers, report), [selectedChannels, selectedUsers]);

    console.log("report", report);
    console.log("selection", selectedUsers, selectedChannels);
    //console.log("data", data);

    useLayoutEffect(() => dataProvider.updateAuthors(selectedUsers), [selectedUsers]);
    useLayoutEffect(() => dataProvider.updateChannels(selectedChannels), [selectedChannels]);

    return <>
        <Header title={report.title} tab={tab} setTab={setTab} />

        <TabContainer currentValue={tab} value="messages">
            <Card>
                <Title>Messages sent per day &amp; month</Title>
                <MessagesGraph/>
            </Card>
            <Card>
                <Title>Messages stats</Title>
                <SimpleTable/>
            </Card>
            <Card>
                <Title>Messages kind</Title>
                <PieChart />
            </Card>
            <Card>
                <Title>Messages heatmap</Title>
                <HeatMapChart />
            </Card>
        </TabContainer>
        <TabContainer currentValue={tab} value="language">
            <Card>
                <WordCloudGraph getData="getWordsData" />
            </Card>
            <Card>
                <DonutChart />
            </Card>
        </TabContainer>
        <TabContainer currentValue={tab} value="emojis">
            <Card>
                <WordCloudGraph getData="getEmojisData" />
            </Card>
        </TabContainer>

        {/*<MessagesHeatMap timeRange={selectedTimeRange} />*/}
    </>;
};

export default ReportPage;
