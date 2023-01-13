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
    size?: number;
}

interface BaseLabelProps {
    title: string;
    name?: string | ReactElement;
    avatar?: LabelImageProps;
    icon?: LabelImageProps | ReactElement;
    link?: string;
}

const LabelImage = ({ image, className }: { image: LabelImageProps | ReactElement; className: string }) => {
    let content: ReactElement;
    let size: number | undefined;

    if ("placeholder" in image) {
        content = image.url ? <LazyImage src={image.url} children={image.placeholder} /> : image.placeholder;
        size = image.size;
    } else {
        // custom icon provided
        content = image;
    }

    return <div className={className} style={{ width: size, height: size }} children={content} />;
};

const BaseLabel = ({ title, name, avatar, icon, link }: BaseLabelProps) => (
    <div className={["Label", link ? "Label-link" : ""].join(" ")} title={title}>
        {avatar && <LabelImage image={avatar} className="Label__avatar" />}
        {icon && <LabelImage image={icon} className="Label__icon" />}
        {link ? (
            <a href={link} target="_blank" className="Label__name" children={name} />
        ) : (
            <span className="Label__name" children={name} />
        )}
        {link && <img className="Label__linkout" src={LinkOutIcon} width={12} height={12} />}
    </div>
);

export { BaseLabel };
