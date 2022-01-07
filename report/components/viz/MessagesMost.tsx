import { MessagesStats } from "@pipeline/aggregate/blocks/MessagesStats";
import AnimatedBars from "@report/components/viz/AnimatedBars";
import AuthorLabel from "@report/components/core/AuthorLabel";
import ChannelLabel from "@report/components/core/ChannelLabel";

const MessagesMostAuthors = ({ data }: { data: MessagesStats }) => (
    <AnimatedBars
        what="Author"
        unit="Total messages"
        data={data.mostAuthors}
        itemComponent={AuthorLabel}
        maxItems={16}
        colorHue={240}
    />
);

const MessagesMostChannels = ({ data }: { data: MessagesStats }) => (
    <AnimatedBars
        what="Channel"
        unit="Total messages"
        data={data.mostChannels}
        itemComponent={ChannelLabel}
        maxItems={16}
        colorHue={266}
    />
);

export { MessagesMostAuthors, MessagesMostChannels };
