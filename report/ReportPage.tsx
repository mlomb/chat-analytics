import "@assets/styles/ReportPage.less";

import { useEffect, useState } from "react";

import { useDataProvider } from "@report/DataProvider";

import Header from "@report/components/Header";
import Footer from "@report/components/Footer";
import LoadingOverlay from "@report/components/LoadingOverlay";
import Card from "@report/components/Card";
import { TabContainer } from "@report/components/Tabs";

import MessagesGraph from "@report/components/viz/MessagesGraph";
import MessagesStatsTable from "@report/components/cards/MessagesStatsTable";
import LanguageStatsTable from "@report/components/cards/LanguageStatsTable";
import EmojiStatsTable from "@report/components/cards/EmojiStatsTable";
import TopReacted from "@report/components/cards/TopReacted";
import {
    MostLinkedDomains,
    MostMentioned,
    MostMessagesAuthors,
    MostMessagesChannels,
    MostProducerEmojis,
    MostUsedEmojis,
    MostUsedWords,
} from "@report/components/cards/MostUsedCards";

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
                    <Card num={1} title="Message statistics" blockKey="messages-stats" children={MessagesStatsTable} />
                    <Card
                        num={1}
                        blockKey="messages-stats"
                        title={["Peak Activity", ["overview", "heatmap"]]}
                        children={() => <div>TO-DO</div>}
                    />
                    <Card
                        num={1}
                        blockKey="messages-stats"
                        title="Messages sent by author"
                        children={MostMessagesAuthors}
                    />
                    <Card
                        num={1}
                        blockKey="messages-stats"
                        title="Messages sent by channel"
                        children={MostMessagesChannels}
                    />
                </CardContainer>
            </TabContainer>
            <TabContainer currentValue={tab} value="language">
                <CardContainer>
                    <Card num={1} title="Most used words" blockKey="language-stats" children={MostUsedWords} />
                    <Card num={1} title="Language statistics" blockKey="language-stats" children={LanguageStatsTable} />
                </CardContainer>
            </TabContainer>
            <TabContainer currentValue={tab} value="emojis">
                <CardContainer>
                    <Card
                        num={1}
                        title={["Most used", ["emojis (all)", "regular emojis", "custom emojis"]]}
                        blockKey="emoji-stats"
                        children={MostUsedEmojis}
                    />
                    <Card
                        num={1}
                        title={["Emojis sent by", ["authors", "channels"]]}
                        blockKey="emoji-stats"
                        children={MostProducerEmojis}
                    />
                    <Card num={1} title="Emoji statistics" blockKey="emoji-stats" children={EmojiStatsTable} />
                </CardContainer>
            </TabContainer>
            <TabContainer currentValue={tab} value="interaction">
                <CardContainer>
                    <Card num={1} title="Most mentioned" blockKey="interaction-stats" children={MostMentioned} />
                    <Card num={1} title="Top reacted messages" blockKey="interaction-stats" children={TopReacted} />
                </CardContainer>
            </TabContainer>
            <TabContainer currentValue={tab} value="external">
                <CardContainer>
                    <Card num={1} title="Most linked domains" blockKey="external-stats" children={MostLinkedDomains} />
                </CardContainer>
            </TabContainer>

            <Footer />
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
