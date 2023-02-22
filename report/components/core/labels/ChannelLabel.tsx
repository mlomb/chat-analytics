import { ReactNode, memo } from "react";

import { getDatabase } from "@report/WorkerWrapper";
import { ChannelAvatar } from "@report/components/core/avatars/ChannelAvatar";
import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";

import Hashtag from "@assets/images/icons/hashtag.svg";

const _ChannelLabel = ({ index }: LabelProps) => {
    const db = getDatabase();
    const platform = db.config.platform;
    const channel = db.channels[index];
    const guild = db.guilds[channel.guildIndex];

    let title = channel.name;
    let name: ReactNode = channel.name;
    let avatar: ReactNode;
    let icon: ReactNode;

    if (platform === "discord") {
        // prepend the guild name to the channel name
        title = guild.name + " > " + name;

        if (channel.type === "text") {
            // show a # before channel names because Discord does it
            // NOTE: in the future we may want to show the other channel types icons (e.g. voice)
            icon = <img src={Hashtag} height={12} />;
        }
    }

    const showAvatar =
        channel.type !== "text" ||
        // if there are more than two guilds in the report, show the guild avatar
        // so users can distinguish between text channels with the same name
        db.guilds.length >= 2;

    if (showAvatar) {
        avatar = <ChannelAvatar index={index} />;
    }

    return <BaseLabel title={title} name={name} leftIcon={icon} avatar={avatar} />;
};

export const ChannelLabel = memo(_ChannelLabel) as typeof _ChannelLabel;
