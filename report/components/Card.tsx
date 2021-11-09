interface Props {
    children: React.ReactNode;
    num: 1 | 2 | 3;
}

const Card = (props: Props) => {
    return <div className={"Card Card--" + props.num}>{props.children}</div>;
};

export default Card;
