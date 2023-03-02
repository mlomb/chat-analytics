import { memo } from "react";

import { getDatabase } from "@report/WorkerWrapper";
import { GuildAvatar } from "@report/components/core/avatars/GuildAvatar";
import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";

const _GuildLabel = ({ index }: LabelProps) => {
    const db = getDatabase();
    const guild = db.guilds[index];

    return <BaseLabel title={guild.name} name={guild.name} avatar={<GuildAvatar index={index} />} />;
};

export const GuildLabel = memo(_GuildLabel) as typeof _GuildLabel;
