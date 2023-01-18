import { ReactNode } from "react";

import { ChannelLabel } from "@report/components/core/labels/ChannelLabel";
import { GuildLabel } from "@report/components/core/labels/GuildLabel";
import { PlatformLabel } from "@report/components/core/labels/PlatformLabel";
import { useDataProvider } from "@report/DataProvider";
import { BaseLabel } from "./core/labels/BaseLabel";
import { AvatarStack } from "./core/avatars/AvatarStack";
import { AuthorAvatar } from "./core/avatars/AuthorAvatar";
import { ChannelAvatar } from "./core/avatars/ChannelAvatar";
import { GuildAvatar } from "./core/avatars/GuildAvatar";

/*
1 Guild:
  - is "Direct Messages"
     - 1 channel:
       - isDM: [avatars of the two participants] Chat of [A] & [B]
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

const topK = 3;

export const Title = () => {
    const db = useDataProvider().database;

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
};
