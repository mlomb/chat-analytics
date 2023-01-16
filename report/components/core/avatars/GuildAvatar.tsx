import { TextAvatar } from "@report/components/core/avatars/TextAvatar";
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
            let placeholder = <TextAvatar text={guild.name} background="#36393f" color="#DCDDDE" />;

            return (
                <div className="Avatar">
                    <LazyImage src={guild.iconUrl} placeholder={placeholder} />
                </div>
            );
        case "telegram":
            return (
                <TextAvatar
                    text={guild.name}
                    background={BackgroundForTelegramAvatar(index)}
                    color="#fff"
                    useInitials={2}
                />
            );
        case "messenger":
        case "whatsapp":
            return <PlatformAvatar />;
    }
};
