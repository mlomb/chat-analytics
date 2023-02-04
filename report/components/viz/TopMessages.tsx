import { MessageComplete } from "@pipeline/process/Types";
import { MessageLabel } from "@report/components/core/MessageLabel";

import "@assets/styles/TopMessages.less";

export type TitleFn = (msg: MessageComplete) => string;

interface TopMessagesProps {
    messages: MessageComplete[];
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

const TopMessage = ({ msg, i, title }: { msg: MessageComplete; i: number; title: TitleFn }) => (
    <div className="TopMessage">
        <div>
            <span className="TopMessage__pos">#{i + 1}</span>
            {title(msg)}
        </div>
        <MessageLabel message={msg} />
    </div>
);
