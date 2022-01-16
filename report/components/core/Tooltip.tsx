import "@assets/styles/Tooltip.less";

interface Props {
    content: string;
    position: "top" | "bottom" | "left" | "right";
    children: string | JSX.Element;
}

const Tooltip = ({ content, position, children }: Props) => {
    return (
        <button className="Tooltip" aria-label={content} data-balloon-pos={position} data-balloon-break="">
            {children}
        </button>
    );
};

export default Tooltip;
