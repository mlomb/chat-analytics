import { Platform } from "@pipeline/Types";

interface PlatformInformation {
    name: string;

    support: {
        stickers: boolean;
        reactions: boolean;
    };
}

export const PlatformsInfo: {
    [key in Platform]: PlatformInformation;
} = {
    discord: {
        name: "Discord",
        support: {
            stickers: false,
            reactions: true,
        },
    },
    telegram: {
        name: "Telegram",
        support: {
            stickers: false,
            reactions: false,
        },
    },
    whatsapp: {
        name: "WhatsApp",
        support: {
            stickers: true,
            reactions: false,
        },
    },
};
