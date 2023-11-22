import { ReactNode, memo } from "react";

import { getDatabase } from "@report/WorkerWrapper";
import { AuthorAvatar } from "@report/components/core/avatars/AuthorAvatar";
import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";

import BotIcon from "@assets/images/icons/bot.svg";

const _AuthorLabel = ({ index }: LabelProps) => {
    const db = getDatabase();
    const isDemo = db.config.demo;
    const author = db.authors[index];

    const title = author.n + (author.b ? " (bot)" : "");
    const avatar = <AuthorAvatar index={index} />;
    let name: ReactNode = author.n;
    let icon: ReactNode | undefined;

    // add discriminator in Discord
    if (db.config.platform === "discord") {
        const parts = author.n.split("#");
        const nick = parts[0];
        const discr: string | undefined = parts[1];

        // only keep if it's 4 chars (and not a deleted ID)
        if (!isDemo && discr && discr.length === 4) {
            name = (
                <>
                    {nick}
                    <span className="Label__discriminator">#{discr}</span>
                </>
            );
        }
    }

    if (author.b) {
        icon = <img src={BotIcon} height={15} />;
    }

    return <BaseLabel title={title} name={name} avatar={avatar} rightIcon={icon} />;
};

export const AuthorLabel = memo(_AuthorLabel) as typeof _AuthorLabel;
