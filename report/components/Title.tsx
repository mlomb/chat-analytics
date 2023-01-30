import { ReactNode } from "react";

import { useDataProvider } from "@report/DataProvider";
import { AuthorAvatar } from "@report/components/core/avatars/AuthorAvatar";
import { AvatarStack } from "@report/components/core/avatars/AvatarStack";
import { ChannelAvatar } from "@report/components/core/avatars/ChannelAvatar";
import { GuildAvatar } from "@report/components/core/avatars/GuildAvatar";
import { BaseLabel } from "@report/components/core/labels/BaseLabel";
import { ChannelLabel } from "@report/components/core/labels/ChannelLabel";
import { GuildLabel } from "@report/components/core/labels/GuildLabel";

const topK = 3;

export const Title = () => {
    const db = useDataProvider().database;

    if (db.config.platform !== "discord") {
        /*
        We assume there is always only one guild.

        1 DM channel: [two default platform avatars] ... [A] & [B]
        1 Group channel: [icon of the group] [Group name]
        2+ channels: [platform logo] [Platform name] Chats
        */
        if (db.channels.length === 1) {
            return <ChannelLabel index={0} />;
        }
        return <GuildLabel index={0} />;
    }

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
    let avatars: ReactNode[];

    if (db.guilds.length > 1) {
        const topGuilds = db.guilds
            .map((_, i) => ({
                count: db.channels.filter((c) => c.guildIndex === i).reduce((sum, c) => sum + (c.msgCount || 0), 0),
                index: i,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, topK)
            .map((g) => g.index);

        avatars = topGuilds.map((guildIndex) => <GuildAvatar index={guildIndex} />);
    } else {
        const guild = db.guilds[0];
        if (guild.name !== "Direct Messages") return <GuildLabel index={0} />;
        if (db.channels.length === 1) return <ChannelLabel index={0} />;
        if (db.channels.every((c) => c.type === "group")) {
            const topChannels = db.channels
                .map((c, i) => ({ count: c.msgCount || 0, index: i }))
                .sort((a, b) => b.count - a.count)
                .slice(0, topK)
                .map((c) => c.index);
            avatars = topChannels.map((channelIndex) => <ChannelAvatar index={channelIndex} />);
        } else {
            avatars = new Array(topK).fill(0).map((_, authorIndex) => <AuthorAvatar index={authorIndex} />);
        }
    }

    return <BaseLabel title={db.title} name={db.title} avatar={<AvatarStack avatars={avatars} />} />;
};
