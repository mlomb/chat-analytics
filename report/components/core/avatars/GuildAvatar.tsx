import { LettersAvatar } from "@report/components/core/avatars/LettersAvatar";
import { PlatformAvatar } from "@report/components/core/avatars/PlatformAvatar";
import { BackgroundForTelegramAvatar } from "@report/components/core/avatars/Telegram";
import { LazyImage } from "@report/components/core/LazyImage";
import { useDataProvider } from "@report/DataProvider";

export const GuildAvatar = ({ index }: { index: number }) => {
    const dp = useDataProvider();
    const platform = dp.database.config.platform;
    const guild = dp.database.guilds[index];

    switch (platform) {
        case "discord":
            let placeholder = <LettersAvatar text={guild.name} background="#36393f" color="#DCDDDE" />;

            return (
                <div className="Avatar">
                    <LazyImage src={guild.iconUrl} placeholder={placeholder} />;
                </div>
            );
        case "telegram":
            return <LettersAvatar text={guild.name} background={BackgroundForTelegramAvatar(index)} color="#fff" />;
        case "messenger":
        case "whatsapp":
            return <PlatformAvatar />;
    }
};
