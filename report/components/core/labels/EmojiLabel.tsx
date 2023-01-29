import { ReactElement, memo } from "react";

import { useDataProvider } from "@report/DataProvider";
import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";

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

    const showName =
        emoji.name !== emoji.symbol && (!hideNameIfPossible || (emoji.symbol === undefined && image === null));

    const title = emoji.name;
    const icon = image ? image : <span style={{ color: "#b9b9b9" }}>{emoji.symbol}</span>;
    const name = showName ? (emoji.symbol ? emoji.name : `:${emoji.name}:`) : undefined;

    return <BaseLabel title={title} icon={icon} name={name} />;
};

export const EmojiLabel = memo(_EmojiLabel) as typeof _EmojiLabel;
