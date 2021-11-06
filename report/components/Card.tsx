interface Props {
    children: React.ReactNode;
    num: 1 | 2 | 3;
}

const Card = (props: Props) => {
    return <div className={"card card-" + props.num}>{props.children}</div>;
};

export default Card;
