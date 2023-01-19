import { PlatformAvatar } from "@report/components/core/avatars/PlatformAvatar";
import { TextAvatar } from "@report/components/core/avatars/TextAvatar";
import { LazyImage } from "@report/components/core/LazyImage";
import { useDataProvider } from "@report/DataProvider";

export const GuildAvatar = ({ index }: { index: number }) => {
    const dp = useDataProvider();
    const platform = dp.database.config.platform;
    const guild = dp.database.guilds[index];

    switch (platform) {
        case "discord":
            if (guild.name === "Direct Messages") {
                return <PlatformAvatar />;
            }

            let placeholder = <TextAvatar text={guild.name} background="#36393f" color="#DCDDDE" useInitials={11} />;

            return (
                <div className="Avatar">
                    <LazyImage src={guild.iconUrl} placeholder={placeholder} />
                </div>
            );
        case "telegram":
        case "messenger":
        case "whatsapp":
            return <PlatformAvatar />;
    }
};
