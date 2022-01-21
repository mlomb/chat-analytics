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
        maxItems={16}
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
        maxItems={16}
        colorHue={266}
    />
);

///////////////////////////
/// WORDS
///////////////////////////
const WordsIndexOf = (value: string) => useDataProvider().wordsSearchFormat.indexOf(value);
const WordsInFilter = (index: number, filter: string) => useDataProvider().wordsSearchFormat[index].startsWith(filter);
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
export const MostUsedEmojis = ({ data, options }: { data?: EmojiStats; options: number[] }) => (
    <MostUsed
        what="Emoji"
        unit="Times used"
        counts={data?.emojisCount || EmptyArray}
        filter={EmojiFilterFns[options[0] as unknown as keyof typeof EmojiFilterFns]}
        maxItems={15}
        itemComponent={EmojiLabel}
        searchable
        searchPlaceholder={EmojiFilterPlaceholders[options[0] as unknown as keyof typeof EmojiFilterPlaceholders]}
        transformFilter={(filter: string) => filter.replace(/:/g, "")}
        indexOf={(value) => {
            const rawEmoji = useDataProvider().database.emojis.findIndex((e) => e.c === value);
            if (rawEmoji === -1) return useDataProvider().emojiSearchFormat.indexOf(value);
            return rawEmoji;
        }}
        inFilter={(index, filter) => useDataProvider().emojiSearchFormat[index].includes(filter)}
    />
);
export const MostProducerEmojis = ({ data, options }: { data?: EmojiStats; options: number[] }) => (
    <MostUsed
        what={options[0] === 0 ? "Author" : "Channel"}
        unit="Number of emojis used"
        counts={data ? (options[0] === 0 ? data.authorEmojiCount : data.channelEmojiCount) : []}
        maxItems={15}
        itemComponent={options[0] === 0 ? AuthorLabel : ChannelLabel}
        colorHue={options[0] === 0 ? 240 : 266}
    />
);

///////////////////////////
/// DOMAINS
///////////////////////////
export const MostLinkedDomains = ({ data }: { data?: ExternalStats }) => (
    <MostUsed
        what="Domain"
        unit="Times linked"
        counts={data?.domainsCount || EmptyArray}
        maxItems={15}
        itemComponent={DomainLabel}
        searchable
        searchPlaceholder="Filter domains..."
        indexOf={(value) => useDataProvider().database.domains.indexOf(value)}
        inFilter={(index, filter) => useDataProvider().database.domains[index].includes(filter)}
    />
);

///////////////////////////
/// MENTIONS
///////////////////////////
export const MostMentioned = ({ data }: { data?: InteractionStats }) => (
    <MostUsed
        what="Who"
        unit="Times mentioned"
        counts={data?.mentionsCount || EmptyArray}
        itemComponent={MentionLabel}
        maxItems={16}
        searchable
        searchPlaceholder="Filter @mentions..."
        indexOf={(value) => useDataProvider().mentionsSearchFormat.indexOf(value)}
        inFilter={(index, filter) => useDataProvider().mentionsSearchFormat[index].includes(filter)}
    />
);
