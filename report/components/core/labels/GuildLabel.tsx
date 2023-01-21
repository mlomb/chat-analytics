import { memo } from "react";

import { useDataProvider } from "@report/DataProvider";
import { GuildAvatar } from "@report/components/core/avatars/GuildAvatar";
import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";

const _GuildLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const guild = dp.database.guilds[index];

    return <BaseLabel title={guild.name} name={guild.name} avatar={<GuildAvatar index={index} />} />;
};

export const GuildLabel = memo(_GuildLabel) as typeof _GuildLabel;
