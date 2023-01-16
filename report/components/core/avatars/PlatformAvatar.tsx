import { useDataProvider } from "@report/DataProvider";

import DiscordLogo from "@assets/images/logos/discord.svg";
import MessengerLogo from "@assets/images/logos/messenger.svg";
import TelegramLogo from "@assets/images/logos/telegram.svg";
import WhatsAppLogo from "@assets/images/logos/whatsapp.svg";
import { Platform } from "@pipeline/Types";

const Platforms: {
    [platform in Platform]: {
        logo: any;
        color: [number, number, number];
    };
} = {
    discord: {
        logo: DiscordLogo,
        color: [235, 86, 65],
    },
    messenger: {
        logo: MessengerLogo,
        color: [214, 89, 52],
    },
    telegram: {
        logo: TelegramLogo,
        color: [200, 79, 52],
    },
    whatsapp: {
        logo: WhatsAppLogo,
        color: [142, 70, 49],
    },
};

export const PlatformAvatar = () => {
    const dp = useDataProvider();
    const p = Platforms[dp.database.config.platform];

    return (
        <div className="Avatar">
            <div
                className="PlatformAvatar"
                style={{ backgroundColor: `hsl(${p.color[0]}, ${p.color[1]}%, ${p.color[2]}%)` }}
            >
                <img src={p.logo} alt="" />
            </div>
        </div>
    );
};
