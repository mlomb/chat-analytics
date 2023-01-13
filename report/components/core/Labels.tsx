import "@assets/styles/Labels.less";

import { memo, ReactElement } from "react";

import { useDataProvider } from "@report/DataProvider";
import { LabelProps } from "./labels/BaseLabel";

// NOTE: this file is a bit messy, should be refactored
// there is code that can be easily reused

const _WordLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const word = dp.database.words[index];

    if (word === undefined) {
        return <span>invalid word index {index}</span>;
    }

    return (
        <div className="Label" title={word}>
            <div className="Label__name">{word}</div>
        </div>
    );
};

const _EmojiLabel = ({ index, hideNameIfPossible }: LabelProps & { hideNameIfPossible?: boolean }) => {
    const dp = useDataProvider();
    const emoji = dp.database.emojis[index];

    if (emoji === undefined) {
        return <span>invalid emoji index {index}</span>;
    }

    let image: JSX.Element | null = null;
    if (emoji.id) {
        image = <img src={`https://cdn.discordapp.com/emojis/${emoji.id}.png?size=32`} height={16} />;
    }

    const showName = emoji.n !== emoji.c && (!hideNameIfPossible || (emoji.c === undefined && image === null));

    return (
        <div className="Label" title={emoji.n}>
            <span style={{ marginRight: showName ? 5 : 0, display: "inline-flex" }}>
                {image ? image : <span style={{ color: "#b9b9b9" }}>{emoji.c}</span>}
            </span>
            {showName ? <div className="Label__name">{emoji.c ? emoji.n : `:${emoji.n}:`}</div> : null}
        </div>
    );
};

const _MentionLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const mention = dp.database.mentions[index];

    if (mention === undefined) {
        return <span>invalid mention index {index}</span>;
    }

    return (
        <div className="Label" title={mention}>
            <div className="Label__name">
                <span style={{ color: "#eded3d" }}>@</span>
                {mention}
            </div>
        </div>
    );
};

// memoize labels
export const WordLabel = memo(_WordLabel) as typeof _WordLabel;
export const EmojiLabel = memo(_EmojiLabel) as typeof _EmojiLabel;
export const MentionLabel = memo(_MentionLabel) as typeof _MentionLabel;
