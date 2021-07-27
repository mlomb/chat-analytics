interface Props {
    title: string;
}

const Header = (props: Props) => {
    return (
        <div className="header">
            <h1>{props.title}</h1>
            {/* cosas */}
        </div>
    );
};

export default Header;