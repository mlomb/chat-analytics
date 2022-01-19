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
const WordsIndexOf = (value: string) => useDataProvider().wordsSearchFormat.indexOf(value);
const WordsInFilter = (index: number, filter: string) => useDataProvider().wordsSearchFormat[index].startsWith(filter);
export const MostUsedWords = ({ data }: { data?: LanguageStats }) => (
    <MostUsed
        what="Word"
        unit="Times used"
        counts={data?.wordsCount || []}
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
export const MostUsedEmojis = ({ data }: { data?: EmojiStats }) => (
    <MostUsed
        what="Emoji"
        unit="Times used"
        counts={data?.emojisCount || []}
        maxItems={15}
        itemComponent={EmojiLabel}
        searchable
        searchPlaceholder={'Filter emojis... (e.g. "fire" or "🔥")'}
        indexOf={(value) => useDataProvider().database.emojis.findIndex((e) => e.n === value || e.ns === value)}
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
        counts={data?.domainsCount || []}
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
        counts={data?.mentionsCount || []}
        itemComponent={MentionLabel}
        maxItems={16}
        searchable
        searchPlaceholder="Filter @mentions..."
        indexOf={(value) => useDataProvider().mentionsSearchFormat.indexOf(value)}
        inFilter={(index, filter) => useDataProvider().mentionsSearchFormat[index].includes(filter)}
    />
);
