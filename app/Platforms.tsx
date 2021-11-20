import { ReactNode } from "react";

import { Platform } from "@pipeline/Types";

import DiscordLogo from "@assets/images/logos/discord.svg";
import TelegramLogo from "@assets/images/logos/telegram.svg";
import WhatsAppLogo from "@assets/images/logos/whatsapp.svg";

export const Platforms: {
    platform: Platform;
    title: string;
    color: [number, number, number]; // HSL
    logo: ReactNode;
}[] = [
    {
        platform: "discord",
        title: "Discord",
        color: [235, 86, 65],
        logo: <img src={DiscordLogo} />,
    },
    {
        platform: "telegram",
        title: "Telegram",
        color: [200, 79, 52],
        logo: <img src={TelegramLogo} />,
    },
    {
        platform: "whatsapp",
        title: "WhatsApp",
        color: [142, 70, 49],
        logo: <img src={WhatsAppLogo} />,
    },
];
