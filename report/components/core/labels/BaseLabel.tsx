import "@assets/styles/Labels.less";

import { ReactNode } from "react";

import { Index } from "@pipeline/Types";

import LinkOutIcon from "@assets/images/icons/link-out-blue.svg";

// common props for all labels
export interface LabelProps {
    index: Index;
}

interface BaseLabelProps {
    title: string;
    name?: ReactNode;
    avatar?: ReactNode;
    icon?: ReactNode;
    link?: string;
}

export const BaseLabel = ({ title, name, avatar, icon, link }: BaseLabelProps) => {
    const content = (
        <>
            {avatar && <div className="Label__avatar" children={avatar} />}
            {icon && <div className="Label__icon" children={icon} />}
            {name && <span className="Label__name" children={name} />}
            {link && <img className="Label__linkout" src={LinkOutIcon} width={12} height={12} />}
        </>
    );

    if (link) {
        return (
            <a
                className="Label"
                title={title}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                children={content}
            />
        );
    } else {
        return <div className="Label" title={title} children={content} />;
    }
};
