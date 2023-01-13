import { BaseAvatar } from "@report/components/core/avatars/BaseAvatar";
import { useDataProvider } from "@report/DataProvider";

import DiscordLogo from "@assets/images/logos/discord.svg";
import MessengerLogo from "@assets/images/logos/messenger.svg";
import TelegramLogo from "@assets/images/logos/telegram.svg";
import WhatsAppLogo from "@assets/images/logos/whatsapp.svg";
import { Platform } from "@pipeline/Types";

export const PlatformAvatar = () => {
    const dp = useDataProvider();
    const platform = dp.database.config.platform;

    const logos: { [platform in Platform]: any } = {
        discord: DiscordLogo,
        messenger: MessengerLogo,
        telegram: TelegramLogo,
        whatsapp: WhatsAppLogo,
    };

    return <BaseAvatar>{logos[platform]}</BaseAvatar>;
};
