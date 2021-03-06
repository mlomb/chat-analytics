import { Platform } from "@pipeline/Types";

interface PlatformInformation {
    name: string;

    support: {
        stickers: boolean;
        reactions: boolean;
        replies: boolean;
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
            replies: true,
        },
    },
    telegram: {
        name: "Telegram",
        support: {
            stickers: false,
            reactions: false,
            replies: true,
        },
    },
    whatsapp: {
        name: "WhatsApp",
        support: {
            stickers: true,
            reactions: false,
            replies: false,
        },
    },
};
