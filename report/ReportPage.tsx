import "@assets/styles/ReportPage.less";

import { Fragment, useEffect, useMemo, useState } from "react";

import { useDataProvider } from "@report/DataProvider";
import { PlatformsInfo } from "@pipeline/Platforms";

import Header from "@report/components/Header";
import Footer from "@report/components/Footer";
import LoadingOverlay from "@report/components/LoadingOverlay";
import Card from "@report/components/Card";
import { TabContainer } from "@report/components/Tabs";

import MessagesOverTime from "@report/components/viz/MessagesOverTime";
import SentimentOverTime from "@report/components/viz/SentimentOverTime";
import ActiveAuthorsOverTime from "@report/components/viz/ActiveAuthorsOverTime";
import MessagesStatsTable from "@report/components/cards/MessagesStatsTable";
import LanguageStatsTable from "@report/components/cards/LanguageStatsTable";
import EmojiStatsTable from "@report/components/cards/EmojiStatsTable";
import SentimentStatsTable from "@report/components/cards/SentimentStatsTable";
import ConversationParticipation from "@report/components/viz/ConversationParticipation";
import GrowthOverTime from "@report/components/viz/GrowthOverTime";
import {
    MostConversations,
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
import MessagesActivity from "@report/components/viz/MessagesActivity";

const CardContainer = (props: { children: React.ReactNode }) => <div className="CardContainer">{props.children}</div>;

export interface Section {
    name: string;
    value: string;
    cards: JSX.Element[];
}

const ReportDashboard = () => {
    const [section, setSection] = useState("messages");

    const sections: Section[] = useMemo(() => {
        const { database } = useDataProvider();
        const platformInfo = PlatformsInfo[database.config.platform];

        const conversationTooltip = (
            <>
                <b>❓ Conversation:</b> Every group of messages separated by 30 minutes without messages is considered a
                conversation
                <br />
                This metric is computed per channel
            </>
        );

        const stopwordsTooltip = (
            <>
                ⚠️ Note that stopwords (words that don't add meaningful information such as "the", "a", etc) are{" "}
                <b>not</b> taken into account
            </>
        );

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
                    <Card
                        num={1}
                        title="Message statistics"
                        blockKey="messages-stats"
                        children={MessagesStatsTable}
                        tooltip={
                            database.config.platform === "whatsapp" ? (
                                <>
                                    ⚠️ Note that if the chat has been exported from Android it may not contain
                                    information about the media type (image, sticker, etc). iOS exports do.
                                </>
                            ) : undefined
                        }
                    />,
                    <Card
                        num={1}
                        blockKey="messages-stats"
                        title={["Activity by week day & hour", ["(split)", "(combined)"]]}
                        children={MessagesActivity}
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
                    <Card
                        num={1}
                        title={["Most used words", ["(as table)", "(as word cloud)"]]}
                        blockKey="language-stats"
                        children={MostUsedWords}
                        tooltip={stopwordsTooltip}
                    />,
                    <Card
                        num={1}
                        title="Language statistics"
                        blockKey="language-stats"
                        children={LanguageStatsTable}
                        tooltip={stopwordsTooltip}
                    />,
                ],
            },
            {
                name: "😃 Emojis",
                value: "emojis",
                cards: [
                    <Card
                        num={1}
                        title={["Most used", ["emojis (all)", "regular emojis", "custom emojis"]].concat(
                            platformInfo.support.reactions ? ["in", ["text", "reactions"]] : []
                        )}
                        blockKey="emoji-stats"
                        children={MostUsedEmojis}
                        tooltip={
                            platformInfo.support.reactions
                                ? "Reactions placed in messages written by the authors filtered"
                                : undefined
                        }
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
                cards: [<Card num={1} title="Most mentioned" blockKey="interaction-stats" children={MostMentioned} />]
                    .concat(
                        platformInfo.support.reactions
                            ? [
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
                              ]
                            : []
                    )
                    .concat(
                        platformInfo.support.replies
                            ? [
                                  <Card
                                      num={1}
                                      title="Authors that reply the most messages"
                                      blockKey="interaction-stats"
                                      children={MostRepliesAuthors}
                                      tooltip={'This is clicking "Reply" in the app'}
                                  />,
                              ]
                            : []
                    )
                    .concat(
                        database.authors.length > 2
                            ? [
                                  <Card
                                      num={2}
                                      title="Participation in conversations between the top"
                                      blockKey="conversation-stats"
                                      children={ConversationParticipation}
                                      tooltip={
                                          <>
                                              {conversationTooltip}
                                              <br />
                                              <br />
                                              <b>❓ Between the top:</b> only the 20 most active authors in the period
                                              selected are shown here
                                          </>
                                      }
                                  />,
                              ]
                            : []
                    )
                    .concat([
                        <Card
                            num={1}
                            title="Conversations started"
                            blockKey="conversation-stats"
                            children={MostConversations}
                            tooltip={conversationTooltip}
                        />,
                    ]),
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
                            ["(% of total)", "(# messages)", "(# messages diff)"],
                        ]}
                        blockKey="sentiment-per-cycle"
                        children={SentimentOverTime}
                    />,
                    <Card
                        num={1}
                        title="Sentiment overview"
                        blockKey="sentiment-stats"
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
                cards:
                    database.authors.length <= 2
                        ? []
                        : [
                              <Card
                                  num={3}
                                  title="Active authors over time by month"
                                  blockKey="acitve-authors"
                                  children={ActiveAuthorsOverTime}
                                  tooltip="Authors that have sent at least one message in the month"
                              />,
                              <Card
                                  num={3}
                                  title="Server/group growth"
                                  blockKey="growth"
                                  children={GrowthOverTime}
                                  tooltip="Only authors that sent at least one message are considered"
                              />,
                          ],
            },
        ].filter(({ cards }) => env.isDev || cards.length > 0);
    }, []);

    return (
        <>
            {demo ? <div className="Demo">This report is a demo</div> : null}
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
