import { ReactNode } from "react";

import { Index } from "@pipeline/Types";

import "@assets/styles/Labels.less";

// common props for all labels
export interface LabelProps {
    index: Index;
}

interface BaseLabelProps {
    title: string;
    name?: ReactNode;
    avatar?: ReactNode;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export const BaseLabel = ({ title, name, avatar, leftIcon, rightIcon }: BaseLabelProps) => {
    const content = (
        <>
            {avatar && <div className="Label__avatar" children={avatar} />}
            {leftIcon && <div className="Label__icon Label__icon--left" children={leftIcon} />}
            {name && <span className="Label__name" children={name} />}
            {rightIcon && <div className="Label__icon Label__icon--right" children={rightIcon} />}
        </>
    );

    return <div className="Label" title={title} children={content} />;
};
