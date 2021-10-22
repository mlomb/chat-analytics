interface Props {
    children: React.ReactNode
}

const Card = (props: Props) => {
    return (
        <div className="card">
            {props.children}
        </div>
    );
};

export default Card;