import { Index } from "@pipeline/Types";
import { ConversationStats } from "@pipeline/aggregate/blocks/ConversationStats";
import { EmojiStats } from "@pipeline/aggregate/blocks/EmojiStats";
import { ExternalStats } from "@pipeline/aggregate/blocks/ExternalStats";
import { InteractionStats } from "@pipeline/aggregate/blocks/InteractionStats";
import { LanguageStats } from "@pipeline/aggregate/blocks/LanguageStats";
import { MessagesStats } from "@pipeline/aggregate/blocks/MessagesStats";
import { useDataProvider } from "@report/DataProvider";
import { AuthorLabel } from "@report/components/core/labels/AuthorLabel";
import { ChannelLabel } from "@report/components/core/labels/ChannelLabel";
import { DomainLabel } from "@report/components/core/labels/DomainLabel";
import { EmojiLabel } from "@report/components/core/labels/EmojiLabel";
import { MentionLabel } from "@report/components/core/labels/MentionLabel";
import { WordLabel } from "@report/components/core/labels/WordLabel";
import MostUsed from "@report/components/viz/MostUsed";
import WordCloud from "@report/components/viz/WordCloud";

const EmptyArray: any[] = [];

///////////////////////////
/// AUTHORS
///////////////////////////
export const MostMessagesAuthors = ({ data }: { data?: MessagesStats }) => (
    <MostUsed
        what="Author"
        unit="Total messages"
        counts={data?.authorsCount || EmptyArray}
        itemComponent={AuthorLabel}
        maxItems={Math.min(15, useDataProvider().database.authors.length)}
        colorHue={240}
    />
);
export const MostRepliesAuthors = ({ data }: { data?: InteractionStats }) => (
    <MostUsed
        what="Author"
        unit="Number of messages replied"
        counts={data?.authorsReplyCount || EmptyArray}
        itemComponent={AuthorLabel}
        maxItems={Math.min(15, useDataProvider().database.authors.length)}
        colorHue={240}
    />
);

///////////////////////////
/// CONVERSATIONS
///////////////////////////
export const MostConversations = ({ data, options }: { data?: ConversationStats; options: number[] }) => (
    <MostUsed
        what={options[0] === 0 ? "Author" : "Channel"}
        unit="Number of conversations started"
        counts={data ? (options[0] === 0 ? data.authorConversations : data.channelConversations) : EmptyArray}
        itemComponent={options[0] === 0 ? AuthorLabel : ChannelLabel}
        maxItems={Math.min(
            15,
            Math.max(useDataProvider().database.authors.length, useDataProvider().database.channels.length)
        )}
        colorHue={options[0] === 0 ? 240 : 266}
    />
);

///////////////////////////
/// CHANNELS
///////////////////////////
export const MostMessagesChannels = ({ data }: { data?: MessagesStats }) => (
    <MostUsed
        what="Channel"
        unit="Total messages"
        counts={data?.channelsCount || EmptyArray}
        itemComponent={ChannelLabel}
        maxItems={Math.min(15, useDataProvider().database.channels.length)}
        colorHue={266}
    />
);

///////////////////////////
/// WORDS
///////////////////////////
const WordsIndexOf = (value: string) => useDataProvider().formatCache.words.indexOf(value);
const WordsInFilter = (index: number, filter: string | RegExp) => {
    const word = useDataProvider().formatCache.words[index];
    return filter instanceof RegExp ? filter.test(word) : word.startsWith(filter);
};
export const MostUsedWords = ({ data, options }: { data?: LanguageStats; options: number[] }) =>
    options[0] === 1 ? (
        <WordCloud wordsCount={data?.wordsCount || EmptyArray} />
    ) : (
        <MostUsed
            what="Word"
            unit="Times used"
            counts={data?.wordsCount || EmptyArray}
            maxItems={Math.min(15, useDataProvider().database.words.length)}
            itemComponent={WordLabel}
            searchable
            allowRegex
            searchPlaceholder="Filter words..."
            indexOf={WordsIndexOf}
            inFilter={WordsInFilter}
        />
    );

///////////////////////////
/// EMOJIS
///////////////////////////
const EmojiFilterFns = {
    "0": undefined, // all emoji
    "1": (index: number) => useDataProvider().database.emojis[index].c !== undefined, // regular emoji
    "2": (index: number) => useDataProvider().database.emojis[index].c === undefined, // custom emoji
};
const EmojiFilterPlaceholders = {
    "0": 'Filter emojis... (e.g. "fire", "🔥" or ":pepe:")',
    "1": 'Filter emojis... (e.g. "fire" or "🔥")',
    "2": 'Filter emojis... (e.g. ":pepe:")',
};
const EmojisTransformFilter = (filter: string) => filter.replace(/:/g, "");
const EmojisIndexOf = (value: string) => {
    const rawEmoji = useDataProvider().database.emojis.findIndex((e) => e.c === value);
    if (rawEmoji === -1) return useDataProvider().formatCache.emojis.indexOf(value);
    return rawEmoji;
};
const EmojisInFilter = (index: Index, filter: string) => useDataProvider().formatCache.emojis[index].includes(filter);
export const MostUsedEmojis = ({ data, options }: { data?: EmojiStats; options: number[] }) => (
    <MostUsed
        what="Emoji"
        unit={options[1] === 0 || options[1] === undefined ? "Times used" : "Times reacted"}
        counts={
            data
                ? options[1] === 0 || options[1] === undefined
                    ? data.inText.count
                    : data.inReactions.count
                : EmptyArray
        }
        filter={EmojiFilterFns[options[0] as unknown as keyof typeof EmojiFilterFns]}
        maxItems={Math.min(15, useDataProvider().database.emojis.length)}
        itemComponent={EmojiLabel}
        searchable
        searchPlaceholder={EmojiFilterPlaceholders[options[0] as unknown as keyof typeof EmojiFilterPlaceholders]}
        transformFilter={EmojisTransformFilter}
        indexOf={EmojisIndexOf}
        inFilter={EmojisInFilter}
    />
);
export const MostProducerEmojis = ({ data, options }: { data?: EmojiStats; options: number[] }) => (
    <MostUsed
        what={options[0] === 0 ? "Author" : "Channel"}
        unit="Number of emojis used"
        counts={data ? (options[0] === 0 ? data.inText.authorCount : data.inText.channelCount) : EmptyArray}
        maxItems={Math.min(
            15,
            Math.max(useDataProvider().database.authors.length, useDataProvider().database.channels.length)
        )}
        itemComponent={options[0] === 0 ? AuthorLabel : ChannelLabel}
        colorHue={options[0] === 0 ? 240 : 266}
    />
);
// at this point in the project, I just can't come up with new names
export const MostGetterEmojis = ({ data, options }: { data?: EmojiStats; options: number[] }) => (
    <MostUsed
        what={options[0] === 0 ? "Author" : "Channel"}
        unit="Number of reactions received"
        counts={data ? (options[0] === 0 ? data.inReactions.authorCount : data.inReactions.channelCount) : EmptyArray}
        maxItems={Math.min(
            15,
            Math.max(useDataProvider().database.authors.length, useDataProvider().database.channels.length)
        )}
        itemComponent={options[0] === 0 ? AuthorLabel : ChannelLabel}
        colorHue={options[0] === 0 ? 240 : 266}
    />
);

///////////////////////////
/// DOMAINS
///////////////////////////
const DomainsIndexOf = (value: string) => useDataProvider().database.domains.indexOf(value);
const DomainsInFilter = (index: number, filter: string) => useDataProvider().database.domains[index].includes(filter);
export const MostLinkedDomains = ({ data }: { data?: ExternalStats }) => (
    <MostUsed
        what="Domain"
        unit="Times linked"
        counts={data?.domainsCount || EmptyArray}
        maxItems={Math.min(15, useDataProvider().database.domains.length)}
        itemComponent={DomainLabel}
        searchable
        searchPlaceholder="Filter domains..."
        indexOf={DomainsIndexOf}
        inFilter={DomainsInFilter}
    />
);

///////////////////////////
/// MENTIONS
///////////////////////////
const MentionsIndexOf = (value: string) => useDataProvider().formatCache.mentions.indexOf(value);
const MentionsInFilter = (index: number, filter: string) =>
    useDataProvider().formatCache.mentions[index].includes(filter);
export const MostMentioned = ({ data }: { data?: InteractionStats }) => (
    <MostUsed
        what="Who"
        unit="Times mentioned"
        counts={data?.mentionsCount || EmptyArray}
        itemComponent={MentionLabel}
        maxItems={Math.min(15, useDataProvider().database.mentions.length)}
        searchable
        searchPlaceholder="Filter @mentions..."
        indexOf={MentionsIndexOf}
        inFilter={MentionsInFilter}
    />
);
