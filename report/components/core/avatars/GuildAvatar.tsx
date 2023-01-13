import { ReactNode } from "react";

import { AvatarProps } from "@report/components/core/avatars/BaseAvatar";
import { LettersAvatar } from "@report/components/core/avatars/LettersAvatar";
import { PlatformAvatar } from "@report/components/core/avatars/PlatformAvatar";
import { BackgroundForTelegramAvatar } from "@report/components/core/avatars/Telegram";
import { LazyImage } from "@report/components/core/LazyImage";
import { useDataProvider } from "@report/DataProvider";

export const GuildAvatar = ({ index }: AvatarProps) => {
    const dp = useDataProvider();
    const platform = dp.database.config.platform;
    const guild = dp.database.guilds[index];

    let placeholder: ReactNode | undefined;

    switch (platform) {
        case "discord":
            placeholder = <LettersAvatar text={guild.name} background="#36393f" color="#DCDDDE" />;
            break;
        case "telegram":
            placeholder = (
                <LettersAvatar text={guild.name} background={BackgroundForTelegramAvatar(index)} color="#fff" />
            );
            break;
        case "messenger":
        case "whatsapp":
            placeholder = <PlatformAvatar />;
            break;
    }

    return <LazyImage src={guild.iconUrl} placeholder={placeholder} height={20} />;
};
