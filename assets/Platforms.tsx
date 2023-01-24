import { ReactNode } from "react";

import { Platform } from "@pipeline/Types";

import DiscordLogo from "@assets/images/logos/discord.svg";
import MessengerLogo from "@assets/images/logos/messenger.svg";
import TelegramLogo from "@assets/images/logos/telegram.svg";
import WhatsAppLogo from "@assets/images/logos/whatsapp.svg";

export const Platforms: {
    [key in Platform]: {
        platform: Platform;
        title: string;
        color: [number, number, number]; // HSL
        defaultFilename: string;
        logo: ReactNode;
    };
} = {
    discord: {
        platform: "discord",
        title: "Discord",
        color: [235, 86, 65],
        defaultFilename: "<guild> - <channel> [ID].json",
        logo: <img src={DiscordLogo} alt="" />,
    },
    messenger: {
        platform: "messenger",
        title: "Messenger",
        color: [214, 89, 52],
        defaultFilename: "message_<number>.json",
        logo: <img src={MessengerLogo} alt="" />,
    },
    telegram: {
        platform: "telegram",
        title: "Telegram",
        color: [200, 79, 52],
        defaultFilename: "result.json",
        logo: <img src={TelegramLogo} alt="" />,
    },
    whatsapp: {
        platform: "whatsapp",
        title: "WhatsApp",
        color: [142, 70, 49],
        defaultFilename: "WhatsApp Chat with <chat name>.txt/zip",
        logo: <img src={WhatsAppLogo} alt="" />,
    },
};
