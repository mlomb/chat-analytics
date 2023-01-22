import { useDataProvider } from "@report/DataProvider";
import { AuthorAvatar } from "@report/components/core/avatars/AuthorAvatar";
import { AvatarStack } from "@report/components/core/avatars/AvatarStack";
import { GuildAvatar } from "@report/components/core/avatars/GuildAvatar";
import { BackgroundForTelegramAvatar } from "@report/components/core/avatars/Telegram";
import { TextAvatar } from "@report/components/core/avatars/TextAvatar";

import discord_group_avatar_0 from "@assets/images/platforms/discord/avatars/group_avatar_0.png";
import discord_group_avatar_1 from "@assets/images/platforms/discord/avatars/group_avatar_1.png";
import discord_group_avatar_2 from "@assets/images/platforms/discord/avatars/group_avatar_2.png";
import discord_group_avatar_3 from "@assets/images/platforms/discord/avatars/group_avatar_3.png";
import discord_group_avatar_4 from "@assets/images/platforms/discord/avatars/group_avatar_4.png";
import discord_group_avatar_5 from "@assets/images/platforms/discord/avatars/group_avatar_5.png";
import discord_group_avatar_6 from "@assets/images/platforms/discord/avatars/group_avatar_6.png";
import discord_group_avatar_7 from "@assets/images/platforms/discord/avatars/group_avatar_7.png";
import wpp_group_avatar from "@assets/images/platforms/whatsapp/group_placeholder.png";

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

    if (channel.type === "dm") {
        // if the channel is a DM, show the avatar of the authors
        return (
            <AvatarStack
                avatars={channel.dmAuthorIndexes!.map((i) => (
                    <AuthorAvatar index={i} key={i} />
                ))}
            />
        );
    }

    if (channel.type === "group") {
        if (platform === "telegram") {
            return (
                <TextAvatar
                    text={channel.name}
                    background={BackgroundForTelegramAvatar(index)}
                    color="#fff"
                    useInitials={2}
                />
            );
        }

        let src: any = undefined;

        if (platform === "discord") {
            // Discord uses the timestamp part of the channel snowflake to determine which group avatar to use
            const timestamp = parseInt((BigInt(channel.discordId!) >> BigInt(22)).toString());
            src = DiscordDefaultGroupAvatars[timestamp % DiscordDefaultGroupAvatars.length];
        } else if (platform === "whatsapp") {
            src = wpp_group_avatar;
        }

        if (src) {
            return (
                <div className="Avatar">
                    <img
                        src={src}
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                    />
                </div>
            );
        }
    }

    return <GuildAvatar index={channel.guildIndex} />;
};
