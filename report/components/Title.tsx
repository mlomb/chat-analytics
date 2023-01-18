import { ReactNode } from "react";

import { AuthorAvatar } from "@report/components/core/avatars/AuthorAvatar";
import { AvatarStack } from "@report/components/core/avatars/AvatarStack";
import { ChannelAvatar } from "@report/components/core/avatars/ChannelAvatar";
import { GuildAvatar } from "@report/components/core/avatars/GuildAvatar";
import { PlatformAvatar } from "@report/components/core/avatars/PlatformAvatar";
import { BaseLabel } from "@report/components/core/labels/BaseLabel";
import { ChannelLabel } from "@report/components/core/labels/ChannelLabel";
import { GuildLabel } from "@report/components/core/labels/GuildLabel";
import { useDataProvider } from "@report/DataProvider";

const topK = 3;

export const Title = () => {
    const db = useDataProvider().database;

    if (db.config.platform === "discord") {
        /*
        1 Guild:
          - is "Direct Messages"
             - 1 channel:
               - isDM: [avatars of the two participants] ... [A] & [B]
               - isGroup: [icon of the group] [Group name]
             - 2+ channels:
               - all are DMs: [avatars of the top K authors] Discord DMs
               - all are groups: [icon of top the K groups] Discord Groups
               - a mix: [avatars of the top K authors] Discord Chats
          - isServer: [server icon] [Server name]
        
        2+ Guilds:
          - has "Direct Messages": [icon of top K servers] Discord Servers and DMs
          - only servers: [icon of top K servers] Discord Servers
        */
        if (db.guilds.length === 1) {
            const guild = db.guilds[0];

            if (guild.name === "Direct Messages") {
                if (db.channels.length === 1) {
                    return <ChannelLabel index={0} />;
                } else {
                    const allDMs = db.channels.every((c) => c.type === "dm");
                    const allGroups = db.channels.every((c) => c.type === "group");

                    let name: string;
                    let avatars: ReactNode[] = [];

                    const topAuthors = db.authorsOrder.slice(0, topK);
                    const topChannels = db.channels
                        .map((c, i) => ({ count: c.msgCount || 0, index: i }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, topK)
                        .map((c) => c.index);

                    if (allDMs) {
                        name = "Discord DMs";
                        avatars = topAuthors.map((authorIndex) => <AuthorAvatar index={authorIndex} />);
                    } else if (allGroups) {
                        name = "Discord Groups";
                        avatars = topChannels.map((channelIndex) => <ChannelAvatar index={channelIndex} />);
                    } else {
                        name = "Discord Chats";
                        avatars = topAuthors.map((authorIndex) => <AuthorAvatar index={authorIndex} />);
                    }

                    return <BaseLabel title={name} name={name} avatar={<AvatarStack avatars={avatars} />} />;
                }
            } else {
                return <GuildLabel index={0} />;
            }
        } else {
            const hasDMs = db.guilds.some((g) => g.name === "Direct Messages");

            const topGuilds = db.guilds
                .map((g, i) => ({
                    count: db.channels.filter((c) => c.guildIndex === i).reduce((sum, c) => sum + (c.msgCount || 0), 0),
                    index: i,
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, topK)
                .map((g) => g.index);

            const name: string = hasDMs ? "Discord Servers and DMs" : "Discord Servers";
            const avatars: ReactNode[] = topGuilds.map((guildIndex) => <GuildAvatar index={guildIndex} />);

            return <BaseLabel title={name} name={name} avatar={<AvatarStack avatars={avatars} />} />;
        }
    } else if (
        db.config.platform === "whatsapp" ||
        db.config.platform === "telegram" ||
        db.config.platform === "messenger"
    ) {
        /*
        We assume there is always only one guild.

        1 DM channel: [two default platform avatars] ... [A] & [B]
        1 Group channel: [icon of the group] [Group name]
        2+ channels: [platform logo] [Platform name] Chats
        */
        if (db.channels.length === 1) {
            return <ChannelLabel index={0} />;
        } else {
            return <GuildLabel index={0} />;
        }
    }

    return <>Chats</>;
};
