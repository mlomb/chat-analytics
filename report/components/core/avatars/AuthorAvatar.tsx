import { ReactNode } from "react";

import { AvatarProps, BaseAvatar } from "@report/components/core/avatars/BaseAvatar";
import { LettersAvatar } from "@report/components/core/avatars/LettersAvatar";
import { BackgroundForTelegramAvatar } from "@report/components/core/avatars/Telegram";
import { LazyImage } from "@report/components/core/LazyImage";
import { useDataProvider } from "@report/DataProvider";

import discord_avatar_0 from "@assets/images/platforms/discord/avatars/avatar_0.png";
import discord_avatar_1 from "@assets/images/platforms/discord/avatars/avatar_1.png";
import discord_avatar_2 from "@assets/images/platforms/discord/avatars/avatar_2.png";
import discord_avatar_3 from "@assets/images/platforms/discord/avatars/avatar_3.png";
import discord_avatar_4 from "@assets/images/platforms/discord/avatars/avatar_4.png";
import messenger_avatar from "@assets/images/platforms/messenger/default_avatar.png";
import wpp_avatar from "@assets/images/platforms/whatsapp/default_avatar.png";

const DiscordDefaultAvatars = [
    discord_avatar_0,
    discord_avatar_1,
    discord_avatar_2,
    discord_avatar_3,
    discord_avatar_4,
];

const RawImg = (src: any) => (
    <img
        src={src}
        style={{
            width: "100%",
            height: "100%",
        }}
    />
);

export const AuthorAvatar = ({ index }: AvatarProps) => {
    const dp = useDataProvider();
    const platform = dp.database.config.platform;
    const author = dp.database.authors[index];

    let url: string | undefined;
    let placeholder: ReactNode | undefined;

    switch (platform) {
        case "discord":
            url = author.da ? `https://cdn.discordapp.com/avatars/${author.da}.png?size=32` : undefined;
            placeholder = RawImg(DiscordDefaultAvatars[(author.d || 0) % 5]);
            break;
        case "telegram":
            placeholder = (
                <LettersAvatar text={author.n} background={BackgroundForTelegramAvatar(index)} color="#fff" />
            );
            break;
        case "messenger":
            placeholder = RawImg(messenger_avatar);
            break;
        case "whatsapp":
            placeholder = RawImg(wpp_avatar);
            break;
    }

    return <BaseAvatar>{url ? <LazyImage src={url} placeholder={placeholder} height={20} /> : placeholder}</BaseAvatar>;
};
