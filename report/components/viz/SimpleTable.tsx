interface Props {}

const SimpleTable = (props: Props) => {
    return (
        <div className="simple-table">
            <ul>
                <li>
                    <span>Total messages</span>
                    <span>16.789</span>
                </li>
                <li>
                    <span>Average messages per day</span>
                    <span>8,37</span>
                </li>
                <li>
                    <span>Average message length</span>
                    <span>137,5</span>
                </li>
            </ul>
        </div>
    );
};

export default SimpleTable;
