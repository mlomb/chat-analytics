import "@assets/styles/Labels.less";

import { ReactElement } from "react";

import { Index } from "@pipeline/Types";
import LazyImage from "@report/components/core/LazyImage";

import LinkOutIcon from "@assets/images/icons/link-out-blue.svg";

// common props for all labels
export interface LabelProps {
    index: Index;
}

export interface LabelImageProps {
    url?: string;
    placeholder: ReactElement;
}

interface BaseLabelProps {
    title: string;
    name: string | ReactElement;
    avatar?: LabelImageProps;
    icon?: LabelImageProps;
    link?: string;
}

const LabelImage = ({ url, placeholder }: LabelImageProps) =>
    url ? <LazyImage src={url} children={placeholder} /> : placeholder;

const BaseLabel = ({ title, name, avatar, icon, link }: BaseLabelProps) => (
    <div className={["Label", link ? "Label-link" : ""].join(" ")} title={title}>
        {avatar && (
            <div className="Label__avatar">
                <LabelImage {...avatar} />
            </div>
        )}
        {icon && (
            <div className="Label__icon">
                <LabelImage {...icon} />
            </div>
        )}
        {link ? (
            <a href={link} target="_blank" className="Label__name" children={name} />
        ) : (
            <span className="Label__name" children={name} />
        )}
        {link && <img className="Label__linkout" src={LinkOutIcon} width={12} height={12} />}
    </div>
);

export { BaseLabel };
