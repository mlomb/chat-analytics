import { memo } from "react";

import { BaseLabel, LabelImageProps, LabelProps } from "@report/components/core/labels/BaseLabel";
import { useDataProvider } from "@report/DataProvider";

const _GuildLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const platform = dp.database.config.platform;
    const guild = dp.database.guilds[index];

    const title = guild.name;
    const name = guild.name;

    let avatar: LabelImageProps = {
        url: guild.iconUrl,
        placeholder: <>TO-DO</>,
    };

    return <BaseLabel title={title} name={name} avatar={avatar} />;
};

export const GuildLabel = memo(_GuildLabel) as typeof _GuildLabel;
