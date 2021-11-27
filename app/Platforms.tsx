import { ReactNode } from "react";

import { Platform } from "@pipeline/Types";

import DiscordLogo from "@assets/images/logos/discord.svg";
import TelegramLogo from "@assets/images/logos/telegram.svg";
import WhatsAppLogo from "@assets/images/logos/whatsapp.svg";

import TelegramTreeDots from "@assets/images/instructions/telegram_dots.png";
import TelegramNoMedia from "@assets/images/instructions/telegram_no_media.png";
import TelegramFormat from "@assets/images/instructions/telegram_format.png";
import TelegramExport from "@assets/images/instructions/telegram_export.gif";

export const Platforms: {
    platform: Platform;
    title: string;
    color: [number, number, number]; // HSL
    defaultFilename: string;
    logo: ReactNode;
    instructions: ReactNode;
}[] = [
    {
        platform: "discord",
        title: "Discord",
        color: [235, 86, 65],
        defaultFilename: "<guild> - <channel> [ID].json",
        logo: <img src={DiscordLogo} alt="Discord" />,
        instructions: <>No</>,
    },
    {
        platform: "telegram",
        title: "Telegram",
        color: [200, 79, 52],
        defaultFilename: "result.json",
        logo: <img src={TelegramLogo} alt="Telegram" />,
        instructions: (
            <>
                <ol>
                    <li>
                        <b>
                            Install{" "}
                            <a href="https://desktop.telegram.org" target="_blank">
                                Telegram Desktop
                            </a>{" "}
                        </b>
                        on your PC and login using your phone.
                    </li>
                    <li>
                        <b>Open the Telegram Desktop application</b> on your computer and <b>login using your phone</b>.
                    </li>
                    <li>
                        Go to the chat you intend to analyze and <b>click on the 3 dots</b> in the top right corner.
                        <img src={TelegramTreeDots} height="42" alt="Three dots at the corner" />
                    </li>
                    <li>
                        Click on <b>Export chat history</b>.
                    </li>
                    <li>
                        <b>Unselect all boxes</b>, media files are not analized.
                        <img src={TelegramNoMedia} height="272" alt="No media files" />
                    </li>
                    <li>
                        Change the format to <b>Machine-readable JSON</b>.
                        <img src={TelegramFormat} height="226" alt="Change export format" />
                    </li>
                    <li>
                        Go ahead and <b>click Export</b>.
                        <img src={TelegramExport} height="45" alt="Export" />
                    </li>
                </ol>
            </>
        ),
    },
    {
        platform: "whatsapp",
        title: "WhatsApp",
        color: [142, 70, 49],
        defaultFilename: "WhatsApp Chat with <chat name>.txt",
        logo: <img src={WhatsAppLogo} alt="WhatsApp" />,
        instructions: (
            <>
                <ol>
                    <li>Open WhatsApp in your phone and then select the chat you want to analyze.</li>
                    <li>Press the context menu in the top right corner.</li>
                    <li>In the context menu, press "More" and then "Export chat".</li>
                    <li>When asked to export with or without media, select "Without Media".</li>
                    <li>Save the file and transfer it to this device.</li>
                </ol>
                For more information about exporting, please visit the{" "}
                <a href="https://faq.whatsapp.com/android/chats/how-to-save-your-chat-history" target="_blank">
                    official link
                </a>
                .
            </>
        ),
    },
];
