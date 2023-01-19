import { memo, ReactElement } from "react";

import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";
import { useDataProvider } from "@report/DataProvider";

interface EmojiLabelProps extends LabelProps {
    hideNameIfPossible?: boolean;
}

const _EmojiLabel = ({ index, hideNameIfPossible }: EmojiLabelProps) => {
    const dp = useDataProvider();
    const emoji = dp.database.emojis[index];

    let image: ReactElement | undefined = undefined;
    if (emoji.id) {
        image = <img src={`https://cdn.discordapp.com/emojis/${emoji.id}.png?size=32`} height={16} />;
    }

    const showName = emoji.n !== emoji.c && (!hideNameIfPossible || (emoji.c === undefined && image === null));

    const title = emoji.n;
    const icon = image ? image : <span style={{ color: "#b9b9b9" }}>{emoji.c}</span>;
    const name = showName ? (emoji.c ? emoji.n : `:${emoji.n}:`) : undefined;

    return <BaseLabel title={title} icon={icon} name={name} />;
};

export const EmojiLabel = memo(_EmojiLabel) as typeof _EmojiLabel;
