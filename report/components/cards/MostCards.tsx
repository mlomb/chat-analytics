import { Index } from "@pipeline/Types";
import { useDataProvider } from "@report/DataProvider";
import MostUsed from "@report/components/viz/MostUsed";

import {
    AuthorLabel,
    ChannelLabel,
    WordLabel,
    EmojiLabel,
    DomainLabel,
    MentionLabel,
} from "@report/components/core/Labels";

import { MessagesStats } from "@pipeline/aggregate/blocks/MessagesStats";
import { LanguageStats } from "@pipeline/aggregate/blocks/LanguageStats";
import { EmojiStats } from "@pipeline/aggregate/blocks/EmojiStats";
import { InteractionStats } from "@pipeline/aggregate/blocks/InteractionStats";
import { ExternalStats } from "@pipeline/aggregate/blocks/ExternalStats";

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
        maxItems={15}
        colorHue={240}
    />
);
export const MostRepliesAuthors = ({ data }: { data?: InteractionStats }) => (
    <MostUsed
        what="Author"
        unit="Number of messages replied"
        counts={data?.authorsReplyCount || EmptyArray}
        itemComponent={AuthorLabel}
        maxItems={15}
        colorHue={240}
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
        maxItems={15}
        colorHue={266}
    />
);

///////////////////////////
/// WORDS
///////////////////////////
const WordsIndexOf = (value: string) => useDataProvider().formatCache.words.indexOf(value);
const WordsInFilter = (index: number, filter: string) => useDataProvider().formatCache.words[index].startsWith(filter);
export const MostUsedWords = ({ data }: { data?: LanguageStats }) => (
    <MostUsed
        what="Word"
        unit="Times used"
        counts={data?.wordsCount || EmptyArray}
        maxItems={15}
        itemComponent={WordLabel}
        searchable
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
        unit={options[1] === 0 ? "Times used" : "Times reacted"}
        counts={data ? (options[1] === 0 ? data.inText.count : data.inReactions.count) : EmptyArray}
        filter={EmojiFilterFns[options[0] as unknown as keyof typeof EmojiFilterFns]}
        maxItems={15}
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
        counts={data ? (options[0] === 0 ? data?.inText.authorCount : data?.inText.channelCount) : EmptyArray}
        maxItems={15}
        itemComponent={options[0] === 0 ? AuthorLabel : ChannelLabel}
        colorHue={options[0] === 0 ? 240 : 266}
    />
);
// at this point in the project, I just can't came up with new names
export const MostGetterEmojis = ({ data, options }: { data?: EmojiStats; options: number[] }) => (
    <MostUsed
        what={options[0] === 0 ? "Author" : "Channel"}
        unit="Number of reactions received"
        counts={data ? (options[0] === 0 ? data?.inReactions.authorCount : data?.inReactions.channelCount) : EmptyArray}
        maxItems={15}
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
        maxItems={15}
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
        maxItems={16}
        searchable
        searchPlaceholder="Filter @mentions..."
        indexOf={MentionsIndexOf}
        inFilter={MentionsInFilter}
    />
);
