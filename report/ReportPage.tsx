import "@assets/styles/ReportPage.less";

import { useState } from "react";

import Header from "@report/components/Header";
import { TabContainer } from "@report/components/Tabs";

import Card from "@report/components/Card";
import MessagesGraph from "@report/components/viz/MessagesGraph";
import WordCloudGraph from "@report/components/viz/WordCloudGraph";
import DonutChart from "@report/components/viz/DonutChart";
import PieChart from "@report/components/viz/PieChart";
import SimpleTable from "@report/components/viz/SimpleTable";
import HeatMapChart from "@report/components/viz/HeatMapChart";
import AnimatedBars from "@report/components/viz/AnimatedBars";
import ChannelChip from "@report/components/core/ChannelChip";
import AuthorChip from "@report/components/core/AuthorChip";

const CardContainer = (props: { children: React.ReactNode }) => <div className="CardContainer">{props.children}</div>;

const ReportPage = () => {
    const [tab, setTab] = useState("messages");

    return (
        <>
            <Header tab={tab} setTab={setTab} />

            <TabContainer currentValue={tab} value="messages">
                <CardContainer>
                    <Card
                        num={2}
                        blockKey="MessagesPerCycle"
                        title="Messages sent per day &amp; month"
                        component={MessagesGraph}
                    ></Card>
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
                            data={[]}
                            itemComponent={AuthorChip}
                            maxItems={16}
                            colorHue={240}
                        />
                    </Card>
                    <Card num={1} blockKey="message-most-channel" title="Most messages sent by channel">
                        <AnimatedBars
                            what="Channel"
                            unit="Total messages"
                            data={[]}
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
                            data={[]}
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
        </>
    );
};

export default ReportPage;
