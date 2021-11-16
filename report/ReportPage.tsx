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
import { MessagesPerCycleBlock } from "@pipeline/wrap/MessagesPerCycle";

const CardContainer = (props: { children: React.ReactNode }) => <div className="CardContainer">{props.children}</div>;
//const ChartContainer = ({ children }: { children: React.ReactNode }) => <div className="ChartContainer">{children}</div>;

const ReportPage = () => {
    const report = dataProvider.getSource();

    const [tab, setTab] = useState("messages");

    // let data = useMemo(()=> dataProvider.(selectedChannels, selectedUsers, report), [selectedChannels, selectedUsers]);

    //console.log("report", report);
    //console.log("selection", selectedAuthors, selectedChannels);
    //console.log("data", data);

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
            <Header tab={tab} setTab={setTab} />

            <TabContainer currentValue={tab} value="messages">
                <CardContainer>
                    <Card num={2} blockKey="message-per-cycle" title="Messages sent per day &amp; month">
                        <MessagesGraph />
                    </Card>
                    <Card blockKey="message-stats" num={1} title="Messages stats">
                        <SimpleTable />
                        <PieChart />
                    </Card>
                    <Card num={1} blockKey="message-algo" title="Poner algo aca">
                        this is content
                    </Card>
                    <Card num={1} blockKey="message-most-author" title="Most messages sent by author">
                        <AnimatedBars
                            what="Author"
                            unit="Total messages"
                            data={barsTestAuthors}
                            itemComponent={AuthorChip}
                            maxItems={16}
                            colorHue={240}
                        />
                    </Card>
                    <Card num={1} blockKey="message-most-channel" title="Most messages sent by channel">
                        <AnimatedBars
                            what="Channel"
                            unit="Total messages"
                            data={barsTestChannels}
                            itemComponent={ChannelChip}
                            maxItems={16}
                            colorHue={266}
                        />
                    </Card>
                    <Card num={2} blockKey="message-heatmap" title="Messages heatmap">
                        <HeatMapChart />
                    </Card>
                </CardContainer>
            </TabContainer>
            <TabContainer currentValue={tab} value="language">
                <CardContainer>
                    <Card num={2} blockKey="language-word-cloud">
                        <WordCloudGraph getData="getWordsData" />
                    </Card>
                    <Card num={1} blockKey="language-words" title="Most used words">
                        <AnimatedBars
                            what="Word"
                            unit="Times used"
                            data={barsTestChannels}
                            itemComponent={ChannelChip}
                            maxItems={16}
                        />
                    </Card>
                    <Card num={2} blockKey="language-language">
                        <DonutChart />
                    </Card>
                </CardContainer>
            </TabContainer>
            <TabContainer currentValue={tab} value="emojis">
                <CardContainer>
                    <Card num={2} blockKey="emojis-cloud">
                        <WordCloudGraph getData="getEmojisData" />
                    </Card>
                </CardContainer>
            </TabContainer>

            {/*<MessagesHeatMap timeRange={selectedTimeRange} />*/}
        </>
    );
};

export default ReportPage;
