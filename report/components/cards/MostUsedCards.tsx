import { useDataProvider } from "@report/DataProvider";
import MostUsed from "@report/components/viz/MostUsed";

import AuthorLabel from "@report/components/core/AuthorLabel";
import ChannelLabel from "@report/components/core/ChannelLabel";
import DomainLabel from "@report/components/core/DomainLabel";

import { MessagesStats } from "@pipeline/aggregate/blocks/MessagesStats";
import { LanguageStats } from "@pipeline/aggregate/blocks/LanguageStats";
import { EmojiStats } from "@pipeline/aggregate/blocks/EmojiStats";
import { ExternalStats } from "@pipeline/aggregate/blocks/ExternalStats";

///////////////////////////
/// AUTHORS
///////////////////////////
export const MostMessagesAuthors = ({ data }: { data?: MessagesStats }) => (
    <MostUsed
        what="Author"
        unit="Total messages"
        counts={data?.authorsCount || []}
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
        counts={data?.channelsCount || []}
        itemComponent={ChannelLabel}
        maxItems={16}
        colorHue={266}
    />
);

///////////////////////////
/// WORDS
///////////////////////////
const WordLabel = ({ index }: { index: number }) => <span>{useDataProvider().database.words[index]}</span>;
const WordsIndexOf = (value: string) => useDataProvider().wordsSearchFormat.indexOf(value);
const WordsInFilter = (index: number, filter: string) => useDataProvider().wordsSearchFormat[index].startsWith(filter);
export const MostUsedWords = ({ data }: { data?: LanguageStats }) => (
    <MostUsed
        what="Word"
        unit="Times used"
        searchPlaceholder="Filter words..."
        counts={data?.wordsCount || []}
        maxItems={15}
        itemComponent={WordLabel}
        searchable
        indexOf={WordsIndexOf}
        inFilter={WordsInFilter}
    />
);

///////////////////////////
/// EMOJIS
///////////////////////////
const EmojiLabel = ({ index }: { index: number }) => <span>{useDataProvider().database.emojis[index].n}</span>;
export const MostUsedEmojis = ({ data }: { data?: EmojiStats }) => (
    <MostUsed
        what="Emoji"
        unit="Times used"
        searchPlaceholder={'Filter emojis... (e.g. "fire" or "🔥")'}
        counts={data?.emojisCount || []}
        maxItems={15}
        itemComponent={EmojiLabel}
        searchable
        indexOf={(value) => useDataProvider().database.emojis.findIndex((e) => e.ns.includes(value))}
        inFilter={(index, filter) => useDataProvider().database.emojis[index].ns.includes(filter)}
    />
);

///////////////////////////
/// DOMAINS
///////////////////////////
export const MostLinkedDomains = ({ data }: { data?: ExternalStats }) => (
    <MostUsed
        what="Domain"
        unit="Times linked"
        searchPlaceholder="Filter domains..."
        counts={data?.domainsCount || []}
        maxItems={15}
        itemComponent={DomainLabel}
        searchable
        indexOf={(value) => useDataProvider().database.domains.indexOf(value)}
        inFilter={(index, filter) => useDataProvider().database.domains[index].includes(filter)}
    />
);
