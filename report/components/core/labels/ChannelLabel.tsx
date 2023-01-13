import { memo, ReactNode } from "react";

import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";
import { useDataProvider } from "@report/DataProvider";
import { GuildAvatar } from "@report/components/core/avatars/GuildAvatar";

import Hashtag from "@assets/images/icons/hashtag.svg";

const _ChannelLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const platform = dp.database.config.platform;
    const channel = dp.database.channels[index];
    const guild = dp.database.guilds[channel.guildIndex];

    const title = guild.name + " > " + channel.name;
    const name = channel.name;

    let icon: ReactNode | undefined;
    let avatar: ReactNode | undefined;

    if (platform === "discord") {
        // show a # before channel names because Discord does it
        icon = <img src={Hashtag} height={12} />;
    }

    if (dp.database.guilds.length >= 2) {
        // if there are more than two guild in the report, show the guild avatar
        // so users can distinguish between channels with the same name
        avatar = <GuildAvatar index={channel.guildIndex} />;
    }

    return <BaseLabel title={title} name={name} avatar={avatar} icon={icon} />;
};

export const ChannelLabel = memo(_ChannelLabel) as typeof _ChannelLabel;
