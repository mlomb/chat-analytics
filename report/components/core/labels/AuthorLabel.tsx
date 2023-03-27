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
        let n = author.n;
        let discr = n.split("#").pop();

        // only keep if it's 4 chars (and not a deleted ID)
        if (discr && discr.length === 4) {
            discr = parseInt(discr).toString();
            n = n.slice(0, -5);
        } else discr = undefined;

        name = (
            <>
                {n}
                {discr && <span className="Label__discriminator">#{`${isDemo ? 0 : discr}`.padStart(4, "0")}</span>}
            </>
        );
    }

    if (author.b) {
        icon = <img src={BotIcon} height={15} />;
    }

    return <BaseLabel title={title} name={name} avatar={avatar} rightIcon={icon} />;
};

export const AuthorLabel = memo(_AuthorLabel) as typeof _AuthorLabel;
