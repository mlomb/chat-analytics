import { MessageComplete } from "@pipeline/process/Types";
import { useBlockData } from "@report/BlockHook";
import { TopMessages } from "@report/components/viz/TopMessages";

const EmptyArray: any[] = [];

const TopReactedTitleFns = {
    "0": (msg: MessageComplete) =>
        `${msg.reactions!.reduce((acc, cur) => acc + cur[1], 0).toLocaleString()} reactions in total from ${
            msg.reactions!.length
        } emoji`,
    "1": (msg: MessageComplete) =>
        `${msg.reactions!.reduce((acc, cur) => Math.max(acc, cur[1]), 0).toLocaleString()} reactions in a single emoji`,
};
export const TopReacted = ({ options }: { options: number[] }) => {
    const interactionStats = useBlockData("interaction/stats");
    return (
        <TopMessages
            messages={
                interactionStats
                    ? options[0] === 0
                        ? interactionStats.topTotalReactions
                        : interactionStats.topSingleReactions
                    : EmptyArray
            }
            title={TopReactedTitleFns[options[0] as unknown as keyof typeof TopReactedTitleFns]}
        />
    );
};
