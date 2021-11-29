import "@assets/styles/Button.less";

import { HTMLAttributeAnchorTarget, ReactNode } from "react";

interface Props {
    color: [number, number, number];
    className?: string;
    children: ReactNode;
    disabled?: boolean;
    download?: any;
    href?: string;
    target?: HTMLAttributeAnchorTarget;
    onClick?: () => void;
}

const Button = (props: Props) => {
    const [h, s, l] = props.color;

    const cssStyles = {
        "--default-color": `hsl(${h}, ${s}%, ${l}%)`,
        "--hover-color": `hsl(${h}, ${s}%, ${l - 5}%)`,
        "--disable-color": `hsl(${h}, 0%, ${l}%)`,
    } as React.CSSProperties;

    const classes = ["Button", props.className || ""].join(" ");

    return props.href ? (
        <a
            className={classes}
            href={props.href}
            target={props.target}
            style={cssStyles}
            children={props.children}
            download={props.download}
        />
    ) : (
        <button
            className={classes}
            onClick={props.onClick}
            style={cssStyles}
            children={props.children}
            disabled={props.disabled}
        />
    );
};

export default Button;
