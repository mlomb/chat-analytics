import Spinner from "@assets/spinner.svg";

interface Props<T = {}> {
    children: React.ReactNode;
    title?: string;
    loading?: boolean;
    num: 1 | 2 | 3;
    onData?: (data: T) => void;
}

const Card = (props: Props) => {
    return (
        <div className={"Card Card--" + props.num}>
            {props.title ? <div className="Card_title">{props.title}</div> : null}
            {props.children}
            {props.loading === true && (
                <div className="Card_loading">
                    <img src={Spinner} alt="Loading" height={60} />
                    Loading...
                </div>
            )}
        </div>
    );
};

export default Card;
