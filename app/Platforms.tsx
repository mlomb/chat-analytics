import { ReactNode, useState } from "react";

import { Platform } from "@pipeline/Types";

import DiscordLogo from "@assets/images/logos/discord.svg";
import MessengerLogo from "@assets/images/logos/messenger.svg";
import SlackLogo from "@assets/images/logos/slack.svg";
import TelegramLogo from "@assets/images/logos/telegram.svg";
import WhatsAppLogo from "@assets/images/logos/whatsapp.svg";

import DiscordFormat from "@assets/images/platforms/discord/instructions/discord_format.png";
import DiscordExport from "@assets/images/platforms/discord/instructions/discord_export.gif";
import DiscordChannels from "@assets/images/platforms/discord/instructions/discord_channels.png";

import FacebookTab from "@assets/images/platforms/messenger/instructions/tab.png";
import FacebookFormat from "@assets/images/platforms/messenger/instructions/format.png";
import FacebookDeselect from "@assets/images/platforms/messenger/instructions/deselect.png";
import FacebookMessages from "@assets/images/platforms/messenger/instructions/messages.png";
import FacebookRequest from "@assets/images/platforms/messenger/instructions/request.png";

import TelegramTreeDots from "@assets/images/platforms/telegram/instructions/telegram_dots.png";
import TelegramNoMedia from "@assets/images/platforms/telegram/instructions/telegram_no_media.png";
import TelegramFormat from "@assets/images/platforms/telegram/instructions/telegram_format.png";
import TelegramExport from "@assets/images/platforms/telegram/instructions/telegram_export.gif";

import WhatsAppThreeDots from "@assets/images/platforms/whatsapp/instructions/whatsapp_dots.png";
import WhatsAppIOSNoMedia from "@assets/images/platforms/whatsapp/instructions/whatsapp_ios_no_media.png";
import WhatsAppAndroidNoMedia from "@assets/images/platforms/whatsapp/instructions/whatsapp_android_no_media.png";
import WhatsAppIOSExport from "@assets/images/platforms/whatsapp/instructions/whatsapp_ios_export.png";

const DiscordInstructions = () => {
    return (
        <>
            <ol>
                <li>
                    Download the latest version of{" "}
                    <a href="https://github.com/Tyrrrz/DiscordChatExporter/releases/latest" target="_blank">
                        DiscordChatExporter
                    </a>
                    . You will need a Windows PC or use the CLI.
                </li>
                <li>
                    You will have to obtain a bot token or use your account's token. Refer to{" "}
                    <a
                        href="https://github.com/Tyrrrz/DiscordChatExporter/wiki/GUI%2C-CLI-and-Formats-explained#using-the-gui"
                        target="_blank"
                    >
                        this guide
                    </a>{" "}
                    for more information.
                </li>
                <li>
                    Select the channels you want to export.
                    <img src={DiscordChannels} />
                </li>
                <li>Press the yellow button on the bottom right corner.</li>
                <li>
                    Select the format "JSON".
                    <img src={DiscordFormat} />
                </li>
                <li>
                    Go ahead and <b>click Export</b>.
                    <img src={DiscordExport} />
                </li>
            </ol>
        </>
    );
};

const MessengerInstructions = () => {
    return (
        <>
            <ol>
                <li>
                    Head to
                    <b>
                        {" "}
                        <a href="https://www.facebook.com/dyi" target="_blank">
                            https://www.facebook.com/dyi
                        </a>
                    </b>
                    .
                </li>
                <li>
                    In the "Request a download" tab, change the format to <b>JSON</b>, media quality to <b>Low</b>{" "}
                    (since media files are not analyzed) and Date range to <b>All time</b> (if you want).
                    <img src={FacebookTab} />
                    <img src={FacebookFormat} />
                </li>
                <li>
                    Click to deselect all, then only select <b>Messages</b>.
                    <img src={FacebookDeselect} />
                    <img src={FacebookMessages} />
                </li>
                <li>
                    At the bottom of the page, click <b>Request a download</b>.
                    <img src={FacebookRequest} />
                </li>
                <li>
                    Now wait until the data is ready (may take a day or two), you can find it in the "Available files"
                    tab. Extract the ZIP you downloaded and navigate to the folder <code>messages/inbox/</code> and find
                    the chat you want to analyze.
                </li>
            </ol>
        </>
    );
};

const TelegramInstructions = () => (
    <>
        <ol>
            <li>
                <b>
                    Install{" "}
                    <a href="https://desktop.telegram.org" target="_blank">
                        Telegram Desktop
                    </a>{" "}
                </b>
                on your computer.
            </li>
            <li>
                <b>Open the Telegram Desktop application</b> and <b>login using your phone</b>.
            </li>
            <li>
                Go to the chat you intend to analyze and <b>tap on the 3 dots</b> in the top right corner.
                <img src={TelegramTreeDots} />
            </li>
            <li>
                Click on <b>Export chat history</b>.
            </li>
            <li>
                <b>Unselect all boxes</b>, media files are not analyzed.
                <img src={TelegramNoMedia} />
            </li>
            <li>
                Change the format to <b>Machine-readable JSON</b>.
                <img src={TelegramFormat} />
            </li>
            <li>
                Go ahead and <b>click Export</b>.
                <img src={TelegramExport} />
            </li>
        </ol>
    </>
);

const WhatsAppInstructions = () => {
    const [device, setDevice] = useState<"ios" | "android">("ios");
    return (
        <>
            <div style={{ marginLeft: 10 }}>
                <button
                    className={"DeviceButton" + (device === "ios" ? " DeviceButton--active" : "")}
                    onClick={() => setDevice("ios")}
                >
                    iOS
                </button>
                <button
                    className={"DeviceButton" + (device === "android" ? " DeviceButton--active" : "")}
                    onClick={() => setDevice("android")}
                >
                    Android
                </button>
            </div>
            <ol>
                <li>Open WhatsApp in your phone.</li>
                {device === "ios" && (
                    <>
                        <li>
                            Go to the chat you intend to analyze and <b>tap on the contact name or group subject</b>.
                        </li>
                        <li>
                            <b>Press Export chat</b>.
                            <img src={WhatsAppIOSExport} />
                        </li>
                    </>
                )}
                {device === "android" && (
                    <>
                        <li>
                            Go to the chat you intend to analyze and <b>click on the 3 dots</b> in the top right corner.
                            <img src={WhatsAppThreeDots} />
                        </li>
                        <li>
                            In the context menu, <b>press More</b> and then <b>Export chat</b>.
                        </li>
                    </>
                )}
                <li>
                    When asked to export with or without media, <b>select Without Media</b>. Media files are not
                    analyzed.
                    <img src={device === "ios" ? WhatsAppIOSNoMedia : WhatsAppAndroidNoMedia} />
                </li>
                <li>Save the file and transfer it to this device, you will need it for the next step.</li>
            </ol>
        </>
    );
};

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
        logo: <img src={DiscordLogo} alt="" />,
        instructions: <DiscordInstructions />,
    },
    {
        platform: "messenger",
        title: "Messenger",
        color: [214, 89, 52],
        defaultFilename: "message_<number>.json",
        logo: <img src={MessengerLogo} alt="" />,
        instructions: <MessengerInstructions />,
    },
    {
        platform: "telegram",
        title: "Telegram",
        color: [200, 79, 52],
        defaultFilename: "result.json",
        logo: <img src={TelegramLogo} alt="" />,
        instructions: <TelegramInstructions />,
    },
    {
        platform: "whatsapp",
        title: "WhatsApp",
        color: [142, 70, 49],
        defaultFilename: "WhatsApp Chat with <chat name>.txt/zip",
        logo: <img src={WhatsAppLogo} alt="" />,
        instructions: <WhatsAppInstructions />,
    },
    {
        platform: "slack",
        title: "Slack",
        color: [299, 56, 19],
        defaultFilename: "<workspace> Slack export <start date> - <end date>.zip",
        logo: <img src={SlackLogo} alt="" />,
        instructions: <>write instructions here</>,
    },
];
