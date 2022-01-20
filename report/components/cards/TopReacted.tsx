import { InteractionStats } from "@pipeline/aggregate/blocks/InteractionStats";
import { MessageLabel } from "@report/components/core/MessageLabel";

const TopReacted = ({ data }: { data?: InteractionStats }) => {
    return (
        <div>
            1
            <MessageLabel message={data?.topReaction || undefined} />
            2
            <MessageLabel message={data?.topReaction || undefined} />
            3
            <MessageLabel message={data?.topReaction || undefined} />
        </div>
    );
};

export default TopReacted;
