import "@assets/styles/Labels.less";

import { ReactElement } from "react";

import { Index } from "@pipeline/Types";
import LazyImage from "@report/components/core/LazyImage";

// common props for all labels
export interface LabelProps {
    index: Index;
}

export interface LabelAvatar {
    url?: string;
    placeholder: ReactElement;
}

interface BaseLabelProps {
    title: string;
    name: ReactElement;
    avatar?: LabelAvatar;
}

const BaseLabel = ({ title, name, avatar }: BaseLabelProps) => (
    <div className="Label" title={title}>
        {avatar ? (
            <div className="Label__avatar">
                {avatar.url ? <LazyImage src={avatar.url} children={avatar.placeholder} /> : avatar.placeholder}
            </div>
        ) : null}
        <span className="Label__name">{name}</span>
    </div>
);

export default BaseLabel;
