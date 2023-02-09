import { ReactElement, memo } from "react";

import { useDataProvider } from "@report/DataProvider";
import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";

interface EmojiLabelProps extends LabelProps {
    hideNameIfPossible?: boolean;
}

const _EmojiLabel = ({ index, hideNameIfPossible }: EmojiLabelProps) => {
    const dp = useDataProvider();
    const emoji = dp.database.emojis[index];

    let name: string;
    let symbol: string | undefined;
    let image: ReactElement | undefined;

    if (emoji.type === "unicode") {
        name = emoji.name;
        symbol = emoji.symbol;
    } else {
        name = `:${emoji.name}:`;
        if (emoji.id !== undefined) {
            // the only emojis with IDs right now are Discord emojis
            image = <img src={`https://cdn.discordapp.com/emojis/${emoji.id}.png?size=32`} height={16} />;
        }
    }

    const showName = name !== symbol && (!hideNameIfPossible || (symbol === undefined && image === null));

    const icon = image ? image : <span style={{ color: "#b9b9b9" }}>{symbol}</span>;

    return <BaseLabel title={emoji.name} icon={icon} name={showName ? name : undefined} />;
};

export const EmojiLabel = memo(_EmojiLabel) as typeof _EmojiLabel;
