import { InteractionStats } from "@pipeline/aggregate/blocks/InteractionStats";
import { MessageLabel } from "@report/components/core/MessageLabel";

const TopReacted = ({ data }: { data?: InteractionStats }) => {
    return (
        <div>
            {data?.topReactions.map((arr, i) => (
                <div key={i}>
                    <span>{arr[1]}</span>
                    <MessageLabel message={arr[0]} />
                </div>
            ))}
        </div>
    );
};

export default TopReacted;
