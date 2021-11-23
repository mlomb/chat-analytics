import "@assets/styles/Button.less";

import { HTMLAttributeAnchorTarget, ReactNode } from "react";
import { css } from "@emotion/react";

interface Props {
    color: [number, number, number];
    className?: string;
    children: ReactNode;
    href?: string;
    target?: HTMLAttributeAnchorTarget;
    onClick?: () => void;
}

const Button = (props: Props) => {
    const [h, s, l] = props.color;

    const cssStyles = [
        css`
            background-color: hsl(${h}, ${s}%, ${l}%);
            &:hover {
                background-color: hsl(${h}, ${s}%, ${l - 5}%);
            }
        `,
    ];

    const classes = ["Button", props.className || ""].join(" ");

    return props.href ? (
        <a className={classes} href={props.href} target={props.target} css={cssStyles} children={props.children} />
    ) : (
        <button className={classes} onClick={props.onClick} css={cssStyles} children={props.children} />
    );
};

export default Button;
