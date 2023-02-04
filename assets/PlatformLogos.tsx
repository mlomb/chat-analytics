import { ReactNode } from "react";

import { Platform } from "@pipeline/Platforms";

import DiscordLogo from "@assets/images/logos/discord.svg";
import MessengerLogo from "@assets/images/logos/messenger.svg";
import TelegramLogo from "@assets/images/logos/telegram.svg";
import WhatsAppLogo from "@assets/images/logos/whatsapp.svg";

export const PlatformLogos: {
    [key in Platform]: ReactNode;
} = {
    discord: <img src={DiscordLogo} alt="" />,
    messenger: <img src={MessengerLogo} alt="" />,
    telegram: <img src={TelegramLogo} alt="" />,
    whatsapp: <img src={WhatsAppLogo} alt="" />,
};
