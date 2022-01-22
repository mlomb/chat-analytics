import "@assets/styles/Labels.less";

import { AttachmentType, FullMessage } from "@pipeline/Types";
import { Day, formatTime } from "@pipeline/Time";
import {
    AuthorLabel,
    ChannelLabel,
    DomainLabel,
    EmojiLabel,
    MentionLabel,
    WordLabel,
} from "@report/components/core/Labels";
import Tooltip from "@report/components/core//Tooltip";
import { useDataProvider } from "@report/DataProvider";

interface ChipProps {
    type: "attachment" | "link" | "mention" | "word" | "emoji";
    index: number;
    count: number;
}

const order = ["attachment", "link", "mention", "word", "emoji"];
const sortFn = (a: ChipProps, b: ChipProps) => {
    if (a.type === b.type) {
        // if type is the same, sort by count
        return b.count - a.count;
    } else {
        // if type is different, sort by order
        return order.indexOf(a.type) - order.indexOf(b.type);
    }
};

export const MessageLabel = (props: { message?: FullMessage }) => {
    const dp = useDataProvider();
    const msg = props.message;

    if (msg === undefined) {
        return <div className="MessageLabel"></div>;
    }

    const day = Day.fromKey(dp.database.time.minDate).nextDays(msg.day);
    const date = formatTime(day, msg.secondOfDay, { showDate: true, showTime: false, hideSeconds: false });
    const fullDateTime = formatTime(day, msg.secondOfDay);

    const chips: ChipProps[] = ([] as ChipProps[])
        .concat(
            msg.attachments?.map((x) => ({ type: "attachment", index: x[0], count: x[1] })) || [],
            msg.words?.map((x) => ({ type: "word", index: x[0], count: x[1] })) || [],
            msg.emojis?.map((x) => ({ type: "emoji", index: x[0], count: x[1] })) || [],
            msg.mentions?.map((x) => ({ type: "mention", index: x[0], count: x[1] })) || [],
            msg.domains?.map((x) => ({ type: "link", index: x[0], count: x[1] })) || []
        )
        .sort(sortFn);

    const reactions = (msg.reactions || []).sort((a, b) => b[1] - a[1]);

    return (
        <div className="MessageLabel">
            <div className="MessageLabel__main">
                <div className="MessageLabel__header">
                    <div className="MessageLabel__author">
                        <AuthorLabel index={msg.authorIndex} />
                    </div>
                    <span className="MessageLabel__on">on</span>
                    <div className="MessageLabel__channel">
                        <ChannelLabel index={msg.channelIndex} />
                    </div>
                    <Tooltip
                        content={<>{fullDateTime}</>}
                        children={<div className="MessageLabel__time">{date}</div>}
                    />
                </div>
                <div className="MessageLabel__chips">
                    {chips.length === 0 && <div className="MessageLabel__empty">No content found</div>}
                    {chips.map((c) => (
                        <Chip chip={c} />
                    ))}
                </div>
            </div>
            <div className="MessageLabel__reactions">
                {reactions.map((r) => (
                    <Tooltip content="reaction">
                        <div className="MessageLabel__reaction">
                            <EmojiLabel index={r[0]} hideNameIfPossible />
                            <span className="MessageLabel__reactionCount">{r[1]}</span>
                        </div>
                    </Tooltip>
                ))}
            </div>
        </div>
    );
};

const Chip = (props: { chip: ChipProps }) => {
    const { type, index, count } = props.chip;

    let content: JSX.Element | null = null;

    switch (type) {
        case "attachment":
            let kind: string = "unknown";
            // prettier-ignore
            switch (index as AttachmentType) {
                case AttachmentType.Image: kind = "image"; break;
                case AttachmentType.ImageAnimated: kind = "GIF"; break;
                case AttachmentType.Video: kind = "video"; break;
                case AttachmentType.Sticker: kind = "sticker"; break;
                case AttachmentType.Audio: kind = "audio"; break;
                case AttachmentType.Document: kind = "document"; break;
                case AttachmentType.Other: kind = "other attachment"; break;
            }
            content = <span className="MessageLabel__attachment">{kind}</span>;
            break;
        case "word":
            content = <WordLabel index={index} />;
            break;
        case "emoji":
            content = <EmojiLabel index={index} hideNameIfPossible />;
            break;
        case "mention":
            content = <MentionLabel index={index} />;
            break;
        case "link":
            content = <DomainLabel index={index} />;
            break;
    }

    return (
        <Tooltip content={type}>
            <div className={["MessageLabelChip", "MessageLabelChip--" + type].join(" ")}>
                <div className="MessageLabelChip__content">{content}</div>
                {count > 1 && <div className="MessageLabelChip__count">{count}</div>}
            </div>
        </Tooltip>
    );
};
