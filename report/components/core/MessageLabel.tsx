import "@assets/styles/Labels.less";

import { Message } from "@pipeline/Types";
import { Day, formatTime } from "@pipeline/Time";
import { AuthorLabel, ChannelLabel, EmojiLabel, MentionLabel, WordLabel } from "@report/components/core/Labels";
import Tooltip from "@report/components/core//Tooltip";
import { useDataProvider } from "@report/DataProvider";

interface ChipProps {
    type: "attachment" | "word" | "emoji" | "mention" | "link";
    index: number;
    count: number;
}

export const MessageLabel = (props: { message?: Message }) => {
    const dp = useDataProvider();
    const msg = props.message;

    if (msg === undefined) {
        return <div className="MessageLabel"></div>;
    }

    const day = Day.fromKey(dp.database.time.minDate).nextDays(msg.day);
    const date = formatTime(day, msg.secondOfDay, { showDate: true, showTime: false, hideSeconds: false });
    const fullDateTime = formatTime(day, msg.secondOfDay);

    const chips: ChipProps[] = ([] as ChipProps[]).concat(
        msg.attachments?.map((x) => ({ type: "attachment", index: x[0], count: x[1] })) || [],
        msg.words?.map((x) => ({ type: "word", index: x[0], count: x[1] })) || [],
        msg.emojis?.map((x) => ({ type: "emoji", index: x[0], count: x[1] })) || [],
        msg.mentions?.map((x) => ({ type: "mention", index: x[0], count: x[1] })) || [],
        msg.domains?.map((x) => ({ type: "link", index: x[0], count: x[1] })) || []
    );

    console.log(chips);

    return (
        <div className="MessageLabel">
            <div className="MessageLabel__header">
                <div className="MessageLabel__author">
                    <AuthorLabel index={msg.authorIndex} />
                </div>
                <span className="MessageLabel__on">on</span>
                <div className="MessageLabel__channel">
                    <ChannelLabel index={3} />
                </div>
                <Tooltip content={<>{fullDateTime}</>} children={<div className="MessageLabel__time">{date}</div>} />
            </div>
            <div className="MessageLabel__chips">
                {chips.map((c) => (
                    <Chip chip={c} />
                ))}
            </div>
        </div>
    );
};

const Chip = (props: { chip: ChipProps }) => {
    const { type, index, count } = props.chip;

    let content: JSX.Element | null = null;

    switch (type) {
        case "word":
            content = <WordLabel index={index} />;
            break;
        case "emoji":
            content = <EmojiLabel index={index} />;
            break;
        case "mention":
            content = <MentionLabel index={index} />;
            break;
    }

    return (
        <Tooltip content={type}>
            <div className="MessageLabelChip">
                <div className="MessageLabelChip__content">{content}</div>
                <div className="MessageLabelChip__count">{count}</div>
            </div>
        </Tooltip>
    );
};
