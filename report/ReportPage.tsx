import { Fragment, ReactNode, useEffect, useMemo, useState } from "react";

import { PlatformsInfo } from "@pipeline/Platforms";
import { getDatabase, getWorker } from "@report/WorkerWrapper";
import Card from "@report/components/Card";
import Footer from "@report/components/Footer";
import Header from "@report/components/Header";
import LoadingOverlay from "@report/components/LoadingOverlay";
import { TabContainer } from "@report/components/Tabs";
import {
    MostConversations,
    MostLinkedDomains,
    MostLinks,
    MostMentioned,
    MostMessagesAuthors,
    MostMessagesChannels,
    MostProducerEmojis,
    MostReactionReceiver,
    MostRepliesAuthors,
    MostUsedEmojis,
} from "@report/components/cards/MostCards";
import { TopReacted } from "@report/components/cards/TopCards";
import EmojiStatsTable from "@report/components/cards/emojis/EmojiStatsTable";
import ConversationParticipation from "@report/components/cards/interaction/ConversationParticipation";
import LanguageStatsTable from "@report/components/cards/language/LanguageStatsTable";
import WordsUsage from "@report/components/cards/language/WordsUsage";
import DomainsTree from "@report/components/cards/links/DomainsTree";
import EditTime from "@report/components/cards/messages/EditTime";
import EditedMessages from "@report/components/cards/messages/EditedMessages";
import { MessagesOverTime } from "@report/components/cards/messages/MessagesOverTime";
import MessagesStatsTable from "@report/components/cards/messages/MessagesStatsTable";
import { WeekdayHourActivity } from "@report/components/cards/messages/WeekdayHourActivity";
import SentimentOverTime from "@report/components/cards/sentiment/SentimentOverTime";
import SentimentStatsTable from "@report/components/cards/sentiment/SentimentStatsTable";
import ActiveAuthorsOverTime from "@report/components/cards/timeline/ActiveAuthorsOverTime";
import GrowthOverTime from "@report/components/cards/timeline/GrowthOverTime";

import "@assets/styles/ReportPage.less";

const CardContainer = (props: { children: ReactNode }) => <div className="CardContainer">{props.children}</div>;

export interface Section {
    name: string;
    value: string;
    cards: JSX.Element[];
}

const ReportDashboard = () => {
    const [section, setSection] = useState("messages");

    const sections: Section[] = useMemo(() => {
        const database = getDatabase();
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
                        defaultOptions={database.time.numDays < 365 * 2 ? [0] : [2]}
                        children={MessagesOverTime}
                    />,
                    <Card
                        num={1}
                        title="Message statistics"
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
                        title={["Activity by week day & hour", ["(split)", "(heatmap)"]]}
                        children={WeekdayHourActivity}
                    />,
                    <Card num={1} title="Messages sent by author" children={MostMessagesAuthors} />,
                    <Card num={1} title="Messages sent by channel" children={MostMessagesChannels} />,
                ].concat(
                    platformInfo.support.edits
                        ? [
                              <Card
                                  num={1}
                                  title={["Edited messages", ["by author", "in channel"]]}
                                  children={EditedMessages}
                                  tooltip={
                                      <>
                                          If a message has been edited multiple times, it will count as if it was edited
                                          only once.
                                          <br />
                                          For the percentage, the author/channel <b>
                                              must have at least 100 messages
                                          </b>{" "}
                                          with the current filters
                                      </>
                                  }
                              />,
                              <Card
                                  num={1}
                                  title={"Time between sending and editing"}
                                  children={EditTime}
                                  tooltip="If a message has been edited multiple times, we take the time of the last edit"
                              />,
                          ]
                        : []
                ),
            },
            {
                name: "🅰️ Language",
                value: "language",
                cards: [
                    <Card
                        num={2}
                        title={["Most used words", ["(as table)", "(as word cloud)"]]}
                        children={WordsUsage}
                        tooltip={stopwordsTooltip}
                    />,
                    <Card
                        num={1}
                        title="Language statistics"
                        children={LanguageStatsTable}
                        tooltip={stopwordsTooltip}
                    />,
                ],
            },
            {
                name: "😃 Emoji",
                value: "emoji",
                cards: [
                    <Card
                        num={1}
                        title={["Most used", ["emoji (all)", "regular emoji", "custom emoji"]].concat(
                            platformInfo.support.reactions ? ["in", ["text", "reactions"]] : []
                        )}
                        children={MostUsedEmojis}
                        tooltip={
                            platformInfo.support.reactions
                                ? "Reactions placed in messages written by the authors filtered"
                                : undefined
                        }
                    />,
                    <Card num={1} title={["Emoji sent", ["by author", "in channel"]]} children={MostProducerEmojis} />,
                    <Card num={1} title="Emoji statistics" children={EmojiStatsTable} />,
                ],
            },
            {
                name: "🔗 Links",
                value: "links",
                cards: [
                    <Card num={1} title="Most linked domains" children={MostLinkedDomains} />,
                    <Card num={2} title="Linked by domain hierarchy" children={DomainsTree} />,
                    <Card num={1} title={["Most links sent", ["by author", "in channel"]]} children={MostLinks} />,
                ],
            },
            {
                name: "🌀 Interaction",
                value: "interaction",
                cards: [<Card num={1} title="Most mentioned" children={MostMentioned} />]
                    .concat(
                        platformInfo.support.reactions
                            ? [
                                  <Card
                                      num={1}
                                      title={["Top reacted messages", ["(total)", "(single)"]]}
                                      children={TopReacted}
                                  />,
                                  <Card
                                      num={1}
                                      title={[["Authors", "Channels"], "that get the most reactions"]}
                                      children={MostReactionReceiver}
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
                            title={["Conversations started", ["by author", "in channel"]]}
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
                        defaultOptions={[1, 1]}
                        title={[
                            "Sentiment over time",
                            ["by week", "by month"],
                            ["(% of total)", "(# messages)", "(# messages diff)"],
                        ]}
                        children={SentimentOverTime}
                    />,
                    <Card num={1} title="Sentiment overview" children={SentimentStatsTable} />,
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
                                  title="Active authors over time, by month"
                                  children={ActiveAuthorsOverTime}
                                  tooltip="An author is considered active if it has sent at least one message in the month"
                              />,
                              <Card
                                  num={3}
                                  title="Server/group growth"
                                  children={GrowthOverTime}
                                  tooltip="Only authors that sent at least one message are considered"
                              />,
                          ],
            },
        ].filter(({ cards }) => env.isDev || cards.length > 0);
    }, []);

    const isDemo = getDatabase().config.demo;

    return (
        <>
            {isDemo ? <div className="Demo">This report is a demo</div> : null}
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

    useEffect(
        () =>
            void getWorker().once("ready", () =>
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
