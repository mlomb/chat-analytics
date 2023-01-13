import { memo } from "react";

import { Platform } from "@pipeline/Types";
import { PlatformAvatar } from "@report/components/core/avatars/PlatformAvatar";
import { BaseLabel } from "@report/components/core/labels/BaseLabel";
import { useDataProvider } from "@report/DataProvider";

const names: { [platform in Platform]: string } = {
    discord: "Discord",
    messenger: "Messenger",
    telegram: "Telegram",
    whatsapp: "WhatsApp",
};

const _PlatformLabel = (props: any) => {
    const dp = useDataProvider();
    const platform = dp.database.config.platform;

    const name = names[platform] + " chats";

    return <BaseLabel title={name} name={name} avatar={<PlatformAvatar />} />;
};

export const PlatformLabel = memo(_PlatformLabel) as typeof _PlatformLabel;
