import { useEffect, useLayoutEffect, useMemo, useState } from "react";

import { NewAuthor, NewChannel, NewReport } from "@pipeline/Analyzer";
import { dataProvider, DataProvider } from "@report/DataProvider";
import Header from "./Header";
import Card from "./components/Card";
import FilterSelect from "./components/FilterSelect";
import TimeSelector from "./components/TimeSelector";
import MessagesGraph from "./components/viz/MessagesGraph";
import MessagesHeatMap from "./components/viz/MessagesHeatMap";
import WordCloudGraph from "./components/viz/WordCloudGraph";
import DonutChart from "./components/viz/DonutChart";
import PieChart from "./components/viz/PieChart";
import SimpleTable from "./components/viz/SimpleTable";
import HeatMapChart from "./components/viz/HeatMapChart";
import AnimatedBars, { AnimatedBarEntry } from "./components/viz/AnimatedBars";
import ChannelChip from "./components/core/ChannelChip";
import AuthorChip from "./components/core/AuthorChip";
import { TabContainer } from "./Tabs";

const CardContainer = (props: { children: React.ReactNode }) => <div className="card-container">{props.children}</div>;
//const ChartContainer = ({ children }: { children: React.ReactNode }) => <div className="ChartContainer">{children}</div>;
const Title = ({ children }: { children: React.ReactNode }) => <div className="card-title">{children}</div>;

const ReportPage = () => {
    const report = dataProvider.getSource();

    const [selectedChannels, setSelectedChannels] = useState<NewChannel[]>([...report.channels]);
    const [selectedAuthors, setSelectedAuthors] = useState<NewAuthor[]>([...report.authors]);
    const [tab, setTab] = useState("messages");

    // let data = useMemo(()=> dataProvider.(selectedChannels, selectedUsers, report), [selectedChannels, selectedUsers]);

    //console.log("report", report);
    //console.log("selection", selectedAuthors, selectedChannels);
    //console.log("data", data);

    useLayoutEffect(() => dataProvider.updateAuthors(selectedAuthors), [selectedAuthors]);
    useLayoutEffect(() => dataProvider.updateChannels(selectedChannels), [selectedChannels]);

    const [barsTestAuthors, setBarsTestAuthors] = useState([
        { data: report.authors[0], value: 1 },
        { data: report.authors[1], value: 2 },
        { data: report.authors[2], value: 3 },
        { data: report.authors[3], value: 4 },
        { data: report.authors[4], value: 5 },
        { data: report.authors[5], value: 6 },
        { data: report.authors[6], value: 7 },
        { data: report.authors[7], value: 8 },
        { data: report.authors[8], value: 9 },
        { data: report.authors[9], value: 10 },
        { data: report.authors[10], value: 11 },
        { data: report.authors[11], value: 12 },
        { data: report.authors[12], value: 13 },
        { data: report.authors[13], value: 14 },
        { data: report.authors[14], value: 15 },
    ]);
    const [barsTestChannels, setBarsTestChannels] = useState([
        { data: report.channels[0], value: 1 },
        /*{ data: report.channels[1], value: 2, },
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
        { data: report.channels[14], value: 15, },*/
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
        }, 500000000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Header
                tab={tab}
                setTab={setTab}
                selectedChannels={selectedChannels}
                setSelectedChannels={setSelectedChannels}
                selectedAuthors={selectedAuthors}
                setSelectedAuthors={setSelectedAuthors}
            />

            <TabContainer currentValue={tab} value="messages">
                <CardContainer>
                    <Card num={2}>
                        <Title>Messages sent per day &amp; month</Title>
                        <MessagesGraph />
                    </Card>
                    <Card num={1}>
                        <Title>Most messages sent by author</Title>
                        <AnimatedBars
                            what="Author"
                            unit="Total messages"
                            data={barsTestAuthors}
                            itemComponent={AuthorChip}
                            maxItems={16}
                            colorHue={240}
                        />
                    </Card>
                    <Card num={1}>
                        <Title>Most messages sent by channel</Title>
                        <AnimatedBars
                            what="Channel"
                            unit="Total messages"
                            data={barsTestChannels}
                            itemComponent={ChannelChip}
                            maxItems={16}
                            colorHue={266}
                        />
                    </Card>
                    <Card num={1}>
                        <Title>Messages stats</Title>
                        <SimpleTable />
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
                <Card num={1}>
                    <Title>Most used words</Title>
                    <AnimatedBars
                        what="Word"
                        unit="Times used"
                        data={barsTestChannels}
                        itemComponent={ChannelChip}
                        maxItems={16}
                    />
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
        </>
    );
};

export default ReportPage;
