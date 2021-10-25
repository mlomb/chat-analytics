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
import ChannelChip from "./chips/ChannelChip";
import AuthorChip from "./chips/AuthorChip";

const TabContainer = (props: {
    currentValue: string;
    value: string;
    children: React.ReactNode;
}) => {
    return <div style={{ display: props.currentValue === props.value ? "block" : "none" }}>
        {props.children}
    </div>;
};

const CardContainer = (props: {
    children: React.ReactNode;
}) => {
    return <div className="card-container">
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
            <CardContainer>
                <Card num={2}>
                    <Title>Testing</Title>
                    <ChannelChip platform="discord" channel={{
                        id: "123",
                        name: "general"
                    }} />
                    <ChannelChip platform="whatsapp" channel={report.channels[0]} />
                    <ChannelChip platform="telegram" channel={report.channels[0]} />
                    
                    <AuthorChip platform="discord" author={{
                        id: "123",
                        name: "Piru",
                        channels: {},
                        avatarUrl: "https://cdn.discordapp.com/avatars/343588565688516618/84fc3dc816a42510f138fdcbf13b745c.png?size=40",
                        discord: {
                            discriminator: 0,
                        }
                    }} />
                    <AuthorChip platform="whatsapp" author={report.authors[0]} />
                    <AuthorChip platform="telegram" author={report.authors[0]} />
                </Card>
                <Card num={2}>
                    <Title>Messages sent per day &amp; month</Title>
                    <MessagesGraph/>
                </Card>
                <Card num={1}>
                    <Title>Messages stats</Title>
                    <SimpleTable/>
                </Card>
                <Card num={1}>
                    <Title>Messages kind</Title>
                    <PieChart />
                </Card>
                <Card num={2}>
                    <Title>Messages heatmap</Title>
                    <HeatMapChart />
                </Card>
            </CardContainer>
        </TabContainer>
        <TabContainer currentValue={tab} value="language">
            <Card num={2}>
                <WordCloudGraph getData="getWordsData" />
            </Card>
            <Card num={2}>
                <DonutChart />
            </Card>
        </TabContainer>
        <TabContainer currentValue={tab} value="emojis">
            <Card num={2}>
                <WordCloudGraph getData="getEmojisData" />
            </Card>
        </TabContainer>

        {/*<MessagesHeatMap timeRange={selectedTimeRange} />*/}
    </>;
};

export default ReportPage;
