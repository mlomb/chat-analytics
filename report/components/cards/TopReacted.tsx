import "@assets/styles/TopReacted.less";

import { InteractionStats } from "@pipeline/aggregate/blocks/InteractionStats";
import { FullMessage } from "@pipeline/Types";
import { MessageLabel } from "@report/components/core/MessageLabel";

const TopReacted = ({ data, options }: { data?: InteractionStats; options?: number[] }) => {
    let type: "total" | "single" = options && options[0] === 0 ? "total" : "single";
    let arr = (type === "total" ? data?.topTotalReactions : data?.topSingleReactions) || [];

    return (
        <div>
            {arr.map((msg, i) => (
                <ReactedMessage msg={msg} i={i} type={type} key={i} />
            ))}
        </div>
    );
};

const ReactedMessage = ({ msg, i, type }: { msg: FullMessage; i: number; type: "total" | "single" }) => {
    const totalReactions = msg.reactions!.reduce((acc, cur) => acc + cur[1], 0);
    const maxReactions = msg.reactions!.reduce((acc, cur) => Math.max(acc, cur[1]), 0);

    return (
        <div className="ReactedMessage">
            <div>
                <span className="ReactedMessage__pos">#{i + 1}</span>
                {type === "total"
                    ? `${totalReactions.toLocaleString()} reactions in total from ${msg.reactions?.length || 0} emojis`
                    : null}
                {type === "single" ? `${maxReactions.toLocaleString()} reactions in a single emoji` : null}
            </div>
            <MessageLabel message={msg} />
        </div>
    );
};

export default TopReacted;
