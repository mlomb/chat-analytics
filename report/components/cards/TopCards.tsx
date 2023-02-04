import { InteractionStats } from "@pipeline/aggregate/blocks/InteractionStats";
import { MessageComplete } from "@pipeline/process/Types";
import { TopMessages } from "@report/components/viz/TopMessages";

const EmptyArray: any[] = [];

export const TopReplies = ({ data }: { data?: InteractionStats }) => (
    <TopMessages
        messages={data?.topSingleReactions || EmptyArray}
        title={(msg: MessageComplete) => ` reacted to messages`}
    />
);

const TopReactedTitleFns = {
    "0": (msg: MessageComplete) =>
        `${msg.reactions!.reduce((acc, cur) => acc + cur[1], 0).toLocaleString()} reactions in total from ${
            msg.reactions!.length
        } emojis`,
    "1": (msg: MessageComplete) =>
        `${msg.reactions!.reduce((acc, cur) => Math.max(acc, cur[1]), 0).toLocaleString()} reactions in a single emoji`,
};
export const TopReacted = ({ data, options }: { data?: InteractionStats; options: number[] }) => (
    <TopMessages
        messages={data ? (options[0] === 0 ? data.topTotalReactions : data.topSingleReactions) : EmptyArray}
        title={TopReactedTitleFns[options[0] as unknown as keyof typeof TopReactedTitleFns]}
    />
);
