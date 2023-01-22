// NOTE: we can't use CSS-based tooltips because they break with overflow: hidden containers
import { ReactElement, ReactNode } from "react";

import Tippy from "@tippyjs/react";

import "@assets/styles/Tooltip.less";

interface Props {
    content: ReactNode;
    children: ReactElement;
    placement?: "top" | "bottom" | "left" | "right";
}

export const Tooltip = ({ content, placement, children }: Props) => {
    const wrapper = <div style={{ textAlign: "center" }}>{content}</div>;
    return <Tippy content={wrapper} placement={placement} children={children} theme="translucent" />;
};
