import { memo } from "react";

import { BaseLabel, LabelImageProps, LabelProps } from "@report/components/core/labels/BaseLabel";
import { useDataProvider } from "@report/DataProvider";

import Hashtag from "@assets/images/icons/hashtag.svg";

const _ChannelLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const platform = dp.database.config.platform;
    const channel = dp.database.channels[index];
    const guild = dp.database.guilds[channel.guildIndex];

    const title = guild.name + " > " + channel.name;
    const name = channel.name;

    let icon: LabelImageProps | undefined;
    let avatar: LabelImageProps | undefined;

    if (platform === "discord") {
        // show a # before channel names because Discord does it
        icon = { placeholder: <img src={Hashtag} height={12} /> };
    }

    if (dp.database.guilds.length >= 2) {
        // if there are more than two guild in the report, show the guild avatar
        // so users can distinguish between channels with the same name
        avatar = {
            url: guild.iconUrl,
            placeholder: <>TO-DO</>,
        };
    }

    return <BaseLabel title={title} name={name} avatar={avatar} icon={icon} />;
};

export const ChannelLabel = memo(_ChannelLabel) as typeof _ChannelLabel;
