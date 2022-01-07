import "@assets/styles/DottedTable.less";
import CountUp from "react-countup";

interface Props {
    lines: [string, number, boolean][];
}

const formattingFn = (n: number) => n.toLocaleString();
const formattingFnDec = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2 });

const DottedTable = (props: Props) => {
    return (
        <div className="DottedTable">
            <ul>
                {props.lines.map(([key, value, decimals]) => (
                    <li key={key}>
                        <span className="DottedTable__key">{key}:</span>
                        <span className="DottedTable__value">
                            <CountUp
                                end={value}
                                duration={0.2}
                                decimals={decimals ? 2 : 0}
                                preserveValue
                                formattingFn={decimals ? formattingFnDec : formattingFn}
                            />
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DottedTable;
