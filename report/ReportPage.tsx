import "@assets/styles/ReportPage.less";

import { Fragment, useEffect, useMemo, useState } from "react";

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

export interface Section {
    name: string;
    value: string;
    cards: JSX.Element[];
}

const ReportDashboard = () => {
    const [section, setSection] = useState("messages");

    const sections: Section[] = useMemo(() => {
        return [
            {
                name: "💬 Messages",
                value: "messages",
                cards: [
                    <Card
                        num={2}
                        title={["Messages sent over time", ["by day", "by week", "by month"]]}
                        blockKey="messages-per-cycle"
                        children={MessagesOverTime}
                    />,
                    <Card num={1} title="Message statistics" blockKey="messages-stats" children={MessagesStatsTable} />,
                    <Card
                        num={1}
                        blockKey="messages-stats"
                        title={["Peak Activity", ["overview", "heatmap"]]}
                        children={() => <div>TO-DO</div>}
                    />,
                    <Card
                        num={1}
                        blockKey="messages-stats"
                        title="Messages sent by author"
                        children={MostMessagesAuthors}
                    />,
                    <Card
                        num={1}
                        blockKey="messages-stats"
                        title="Messages sent by channel"
                        children={MostMessagesChannels}
                    />,
                ],
            },
            {
                name: "🅰️ Language",
                value: "language",
                cards: [
                    <Card num={1} title="Most used words" blockKey="language-stats" children={MostUsedWords} />,
                    <Card
                        num={1}
                        title="Language statistics"
                        blockKey="language-stats"
                        children={LanguageStatsTable}
                    />,
                ],
            },
            {
                name: "😃 Emojis",
                value: "emojis",
                cards: [
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
                    />,
                    <Card
                        num={1}
                        title={["Emojis sent", ["by author", "in channel"]]}
                        blockKey="emoji-stats"
                        children={MostProducerEmojis}
                    />,
                    <Card num={1} title="Emoji statistics" blockKey="emoji-stats" children={EmojiStatsTable} />,
                ],
            },
            {
                name: "🌀 Interaction",
                value: "interaction",
                cards: [
                    <Card num={1} title="Most mentioned" blockKey="interaction-stats" children={MostMentioned} />,
                    <Card
                        num={1}
                        title={["Top reacted messages", ["(total)", "(single)"]]}
                        blockKey="interaction-stats"
                        children={TopReacted}
                    />,
                    <Card
                        num={1}
                        title={[["Authors", "Channels"], "that get the most reactions"]}
                        blockKey="emoji-stats"
                        children={MostGetterEmojis}
                    />,
                    <Card
                        num={1}
                        title="Authors that reply the most messages"
                        blockKey="interaction-stats"
                        children={MostRepliesAuthors}
                    />,
                ],
            },
            {
                name: "💙 Sentiment",
                value: "sentiment",
                cards: [
                    <Card
                        num={2}
                        title={[
                            "Sentiment over time",
                            ["by week", "by month"],
                            ["(% difference)", "(raw difference)", "(raw tokens)"],
                        ]}
                        blockKey="sentiment-per-cycle"
                        children={SentimentOverTime}
                    />,
                    <Card
                        num={1}
                        title="Sentiment overview"
                        blockKey="sentiment-per-cycle"
                        children={SentimentStatsTable}
                    />,
                ],
            },
            {
                name: "🔗 External",
                value: "external",
                cards: [
                    <Card num={1} title="Most linked domains" blockKey="external-stats" children={MostLinkedDomains} />,
                ],
            },

            {
                name: "📅 Timeline",
                value: "timeline",
                cards: [],
            },
        ];
    }, []);

    return (
        <>
            <Header sections={sections} section={section} setSection={setSection} />

            {sections.map((s) => (
                <TabContainer key={s.value} value={s.value} currentValue={section}>
                    <CardContainer>
                        {s.cards.map((c, i) => (
                            <Fragment key={i}>{c}</Fragment>
                        ))}
                    </CardContainer>
                </TabContainer>
            ))}

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
