import "@assets/styles/ReportPage.less";

import { useEffect, useState } from "react";

import Header from "@report/components/Header";
import { TabContainer } from "@report/components/Tabs";
import LoadingOverlay from "@report/components/LoadingOverlay";

import { useDataProvider } from "@report/DataProvider";
import AuthorChip from "@report/components/core/AuthorLabel";
import Card from "@report/components/Card";
import MessagesGraph from "@report/components/viz/MessagesGraph";
import WordCloudGraph from "@report/components/viz/WordCloudGraph";
import DonutChart from "@report/components/viz/DonutChart";
import HeatMapChart from "@report/components/viz/HeatMapChart";
import AnimatedBars from "@report/components/viz/AnimatedBars";
import MessagesStats from "@report/components/viz/MessagesStats";

const CardContainer = (props: { children: React.ReactNode }) => <div className="CardContainer">{props.children}</div>;

const ReportDashboard = () => {
    const [tab, setTab] = useState("messages");

    return (
        <>
            <Header tab={tab} setTab={setTab} />
        </>
    );
};

const ReportPage = () => {
    const [loading, setLoading] = useState(true);
    const dataProvider = useDataProvider();

    useEffect(
        () =>
            void dataProvider.once("ready", () =>
                setTimeout(() => setLoading(false), 1000 - Math.min(performance.now(), 1000))
            ),
        []
    );

    return (
        <>
            {!loading && <ReportDashboard />}
            <LoadingOverlay loading={loading} />
        </>
    );
};

export default ReportPage;

/*


            <TabContainer currentValue={tab} value="messages">
                <CardContainer>
                    <Card
                        num={2}
                        title="Messages sent per day &amp; month"
                        blockKey="MessagesPerCycle"
                        component={MessagesGraph}
                    />
                    <Card num={1} title="Messages stats" blockKey="MessagesStats" component={MessagesStats} />
                    <Card num={1} blockKey="message-algo" title="Poner algo aca">
                        this is content
                    </Card>
                    <Card num={1} blockKey="message-most-author" title="Most messages sent by author">
                        {/*<AnimatedBars
                            what="Author"
                            unit="Total messages"
                            data={[]}
                            itemComponent={AuthorChip}
                            maxItems={16}
                            colorHue={240}
                        />* /}
                        </Card>
                        <Card num={1} blockKey="message-most-channel" title="Most messages sent by channel">
                            {/*<AnimatedBars
                                what="Channel"
                                unit="Total messages"
                                data={[]}
                                itemComponent={ChannelChip}
                                maxItems={16}
                                colorHue={266}
                            />* /}
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
                            {/*<AnimatedBars
                                what="Word"
                                unit="Times used"
                                data={[]}
                                itemComponent={ChannelChip}
                                maxItems={16}
                            />* /}
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
                */
