import "@assets/styles/TopMessages.less";

import { FullMessage } from "@pipeline/Types";
import { MessageLabel } from "@report/components/core/MessageLabel";

export type TitleFn = (msg: FullMessage) => string;

interface TopMessagesProps {
    messages: FullMessage[];
    title: TitleFn;
}

export const TopMessages = (props: TopMessagesProps) => {
    return (
        <div>
            {props.messages.map((msg, i) => (
                <TopMessage msg={msg} i={i} key={i} title={props.title} />
            ))}
            {props.messages.length === 0 && <div className="TopMessages__empty">No data to show</div>}
        </div>
    );
};

const TopMessage = ({ msg, i, title }: { msg: FullMessage; i: number; title: TitleFn }) => (
    <div className="TopMessage">
        <div>
            <span className="TopMessage__pos">#{i + 1}</span>
            {title(msg)}
        </div>
        <MessageLabel message={msg} />
    </div>
);
