// NOTE: we can't use CSS-based tooltips because they break with overflow: hidden containers
import Tippy from "@tippyjs/react";
import "@assets/styles/Tooltip.less";

interface Props {
    content: React.ReactNode;
    children: React.ReactElement;
    placement?: "top" | "bottom" | "left" | "right";
}

const Tooltip = ({ content, placement, children }: Props) => {
    const wrapper = <div style={{ textAlign: "center" }}>{content}</div>;
    return <Tippy content={wrapper} placement={placement} children={children} theme="translucent" />;
};

export default Tooltip;
