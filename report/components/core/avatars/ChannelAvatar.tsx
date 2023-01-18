import { AuthorAvatar } from "@report/components/core/avatars/AuthorAvatar";
import { AvatarStack } from "@report/components/core/avatars/AvatarStack";
import { GuildAvatar } from "@report/components/core/avatars/GuildAvatar";
import { useDataProvider } from "@report/DataProvider";

import discord_group_avatar_0 from "@assets/images/platforms/discord/avatars/group_avatar_0.png";
import discord_group_avatar_1 from "@assets/images/platforms/discord/avatars/group_avatar_1.png";
import discord_group_avatar_2 from "@assets/images/platforms/discord/avatars/group_avatar_2.png";
import discord_group_avatar_3 from "@assets/images/platforms/discord/avatars/group_avatar_3.png";
import discord_group_avatar_4 from "@assets/images/platforms/discord/avatars/group_avatar_4.png";
import discord_group_avatar_5 from "@assets/images/platforms/discord/avatars/group_avatar_5.png";
import discord_group_avatar_6 from "@assets/images/platforms/discord/avatars/group_avatar_6.png";
import discord_group_avatar_7 from "@assets/images/platforms/discord/avatars/group_avatar_7.png";

const DiscordDefaultGroupAvatars = [
    discord_group_avatar_0,
    discord_group_avatar_1,
    discord_group_avatar_2,
    discord_group_avatar_3,
    discord_group_avatar_4,
    discord_group_avatar_5,
    discord_group_avatar_6,
    discord_group_avatar_7,
];

export const ChannelAvatar = ({ index }: { index: number }) => {
    const dp = useDataProvider();
    const platform = dp.database.config.platform;
    const channel = dp.database.channels[index];

    if (channel.type === "group" && platform === "discord") {
        const timestamp = parseInt((BigInt(channel.discordId!) >> BigInt(22)).toString());

        return (
            <div className="Avatar">
                <img
                    src={DiscordDefaultGroupAvatars[timestamp % DiscordDefaultGroupAvatars.length]}
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                />
            </div>
        );
    } else if (channel.type === "dm") {
        // if the channel is a DM, show the avatar of the authors
        return (
            <AvatarStack
                avatars={channel.dmAuthorIndexes!.map((i) => (
                    <AuthorAvatar index={i} key={i} />
                ))}
            />
        );
    }

    return <GuildAvatar index={channel.guildIndex} />;
};
