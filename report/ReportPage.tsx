import "@assets/styles/ReportPage.less";

import { useEffect, useState } from "react";

import { useDataProvider } from "@report/DataProvider";

import Header from "@report/components/Header";
import LoadingOverlay from "@report/components/LoadingOverlay";
import Card from "@report/components/Card";
import { TabContainer } from "@report/components/Tabs";

import MessagesGraph from "@report/components/viz/MessagesGraph";
import MessagesStats from "@report/components/viz/MessagesStats";
import { MessagesMostAuthors, MessagesMostChannels } from "@report/components/viz/MessagesMost";

const CardContainer = (props: { children: React.ReactNode }) => <div className="CardContainer">{props.children}</div>;

const ReportDashboard = () => {
    const [tab, setTab] = useState("messages");

    return (
        <>
            <Header tab={tab} setTab={setTab} />

            <TabContainer currentValue={tab} value="messages">
                <CardContainer>
                    <Card
                        num={2}
                        title="Messages sent per day &amp; month"
                        blockKey="messages-per-cycle"
                        children={MessagesGraph}
                    />
                    <Card num={1} title="Messages stats" blockKey="messages-stats" children={MessagesStats} />
                    <Card num={1} blockKey="messages-stats" title="Poner algo aca" children={() => <div>a</div>} />
                    <Card
                        num={1}
                        blockKey="messages-stats"
                        title="Most messages sent by author"
                        children={MessagesMostAuthors}
                    />
                    <Card
                        num={1}
                        blockKey="messages-stats"
                        title="Most messages sent by channel"
                        children={MessagesMostChannels}
                    />
                </CardContainer>
            </TabContainer>
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
