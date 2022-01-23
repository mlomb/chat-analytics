import "@assets/styles/ReportPage.less";

import { useEffect, useState } from "react";

import { useDataProvider } from "@report/DataProvider";

import Header from "@report/components/Header";
import Footer from "@report/components/Footer";
import LoadingOverlay from "@report/components/LoadingOverlay";
import Card from "@report/components/Card";
import { TabContainer } from "@report/components/Tabs";

import MessagesOverTime from "@report/components/viz/MessagesOverTime";
import SentimentOverTime from "@report/components/viz/SentimentOverTime";
import MessagesStatsTable from "@report/components/cards/MessagesStatsTable";
import LanguageStatsTable from "@report/components/cards/LanguageStatsTable";
import EmojiStatsTable from "@report/components/cards/EmojiStatsTable";
import SentimentStatsTable from "@report/components/cards/SentimentStatsTable";
import {
    MostGetterEmojis,
    MostLinkedDomains,
    MostMentioned,
    MostMessagesAuthors,
    MostMessagesChannels,
    MostProducerEmojis,
    MostRepliesAuthors,
    MostUsedEmojis,
    MostUsedWords,
} from "@report/components/cards/MostCards";
import { TopReacted } from "@report/components/cards/TopCards";

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
                        title={["Messages sent over time", ["by day", "by week", "by month"]]}
                        blockKey="messages-per-cycle"
                        children={MessagesOverTime}
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
                        title={[
                            "Most used",
                            ["emojis (all)", "regular emojis", "custom emojis"],
                            "in",
                            ["text", "reactions"],
                        ]}
                        blockKey="emoji-stats"
                        children={MostUsedEmojis}
                    />
                    <Card
                        num={1}
                        title={["Emojis sent", ["by author", "in channel"]]}
                        blockKey="emoji-stats"
                        children={MostProducerEmojis}
                    />
                    <Card num={1} title="Emoji statistics" blockKey="emoji-stats" children={EmojiStatsTable} />
                </CardContainer>
            </TabContainer>
            <TabContainer currentValue={tab} value="interaction">
                <CardContainer>
                    <Card num={1} title="Most mentioned" blockKey="interaction-stats" children={MostMentioned} />
                    <Card
                        num={1}
                        title={["Top reacted messages", ["(total)", "(single)"]]}
                        blockKey="interaction-stats"
                        children={TopReacted}
                    />
                    <Card
                        num={1}
                        title={[["Authors", "Channels"], "that get the most reactions"]}
                        blockKey="emoji-stats"
                        children={MostGetterEmojis}
                    />
                    <Card
                        num={1}
                        title="Authors that reply the most messages"
                        blockKey="interaction-stats"
                        children={MostRepliesAuthors}
                    />
                    {/*
                    <Card
                        num={1}
                        title={["Messages with the most replies"]}
                        blockKey="interaction-stats"
                        children={TopReplies}
                    />
                    */}
                </CardContainer>
            </TabContainer>
            <TabContainer currentValue={tab} value="sentiment">
                <CardContainer>
                    <Card
                        num={2}
                        title={[
                            "Sentiment over time",
                            ["by week", "by month"],
                            ["(% difference)", "(raw difference)", "(raw tokens)"],
                        ]}
                        blockKey="sentiment-per-cycle"
                        children={SentimentOverTime}
                    />
                    <Card
                        num={1}
                        title="Sentiment overview"
                        blockKey="sentiment-per-cycle"
                        children={SentimentStatsTable}
                    />
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
