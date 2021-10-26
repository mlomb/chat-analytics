import { useEffect, useLayoutEffect, useMemo, useState } from "react";

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
import AnimatedBars, { AnimatedBarEntry } from "./AnimatedBars";

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

    const [barsTestAuthors, setBarsTestAuthors] = useState([
        { data: report.authors[0], value: 1, },
        { data: report.authors[1], value: 2, },
        { data: report.authors[2], value: 3, },
        { data: report.authors[3], value: 4, },
        { data: report.authors[4], value: 5, },
        { data: report.authors[5], value: 6, },
        { data: report.authors[6], value: 7, },
        { data: report.authors[7], value: 8, },
        { data: report.authors[8], value: 9, },
        { data: report.authors[9], value: 10, },
        { data: report.authors[10], value: 11, },
        { data: report.authors[11], value: 12, },
        { data: report.authors[12], value: 13, },
        { data: report.authors[13], value: 14, },
        { data: report.authors[14], value: 15, },
    ]);
    const [barsTestChannels, setBarsTestChannels] = useState([
        { data: report.channels[0], value: 1, },
        { data: report.channels[1], value: 2, },
        { data: report.channels[2], value: 3, },
        { data: report.channels[3], value: 4, },
        { data: report.channels[4], value: 5, },
        { data: report.channels[5], value: 6, },
        { data: report.channels[6], value: 7, },
        { data: report.channels[7], value: 8, },
        { data: report.channels[8], value: 9, },
        { data: report.channels[9], value: 10, },
        { data: report.channels[10], value: 11, },
        { data: report.channels[11], value: 12, },
        { data: report.channels[12], value: 13, },
        { data: report.channels[13], value: 14, },
        { data: report.channels[14], value: 15, },
    ]);
    useEffect(() => {
        const interval = setInterval(() => {
            let newBars = JSON.parse(JSON.stringify(barsTestAuthors));
            for (let i = 0; i < newBars.length; i++) {
                newBars[i].value += Math.random() * 1000000;
                newBars[i].value = Math.round(newBars[i].value);
            }
            setBarsTestAuthors(newBars);
            
            newBars = JSON.parse(JSON.stringify(barsTestChannels));
            for (let i = 0; i < newBars.length; i++) {
                newBars[i].value += Math.random() * 1000000;
                newBars[i].value = Math.round(newBars[i].value);
            }
            setBarsTestChannels(newBars);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const channelChip = useMemo(() => (props: { data: NewChannel }) => <ChannelChip platform="discord" channel={props.data} />, []); // TODO: add platform dependency
    const authorChip = useMemo(() => (props: { data: NewAuthor }) => <AuthorChip platform="discord" author={props.data} />, []); // TODO: add platform dependency
    
    return <>
        <Header title={report.title} tab={tab} setTab={setTab} />

        <TabContainer currentValue={tab} value="messages">
            <CardContainer>
                <Card num={2}>
                    <Title>Messages sent per day &amp; month</Title>
                    <MessagesGraph/>
                </Card>
                <Card num={1}>
                    <Title>Most messages sent by author</Title>
                    <AnimatedBars what="Author" unit="Total messages" data={barsTestAuthors} itemComponent={authorChip} maxItems={16} colorHue={240} />
                </Card>
                <Card num={1}>
                    <Title>Most messages sent by channel</Title>
                    <AnimatedBars what="Channel" unit="Total messages" data={barsTestChannels} itemComponent={channelChip} maxItems={16} colorHue={266} />
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
            </CardContainer>
        </TabContainer>
        <TabContainer currentValue={tab} value="language">
            <Card num={2}>
                <WordCloudGraph getData="getWordsData" />
            </Card>
            <Card num={1}>
                <Title>Most used words</Title>
                <AnimatedBars what="Word" unit="Times used" data={barsTestChannels} itemComponent={channelChip} maxItems={16} />
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
