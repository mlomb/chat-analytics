import "@assets/styles/DottedTable.less";
import CountUp from "react-countup";

interface NumberLine {
    type: "number";
    decimals?: number;
    value?: number;
}

interface TimediffLine {
    type: "timediff";
    hours?: number;
}

export type Line = (NumberLine | TimediffLine) & {
    label: string | JSX.Element;
    depth?: number;
};

interface Props {
    lines: Line[];
}

const formattingFn = (n: number) => n.toLocaleString();
const formattingFnDec = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2 });

const LineItem = ({ line }: { line: Line }) => {
    const depth = line.depth || 0;

    let value: JSX.Element;
    switch (line.type) {
        case "number":
            value = (
                <CountUp
                    end={line.value || 0}
                    duration={0.2}
                    decimals={line.decimals || 0}
                    preserveValue
                    formattingFn={line.decimals ? formattingFnDec : formattingFn}
                />
            );
            break;
        case "timediff":
            value = <span>3hs</span>;
            break;
    }

    return (
        <li style={{ paddingLeft: 20 * depth, color: depth === 1 ? "#c7c7c7" : undefined }}>
            <span className="DottedTable__key">{line.label}</span>
            <span className="DottedTable__value" style={{ fontWeight: depth === 0 ? "bold" : undefined }}>
                {value}
            </span>
        </li>
    );
};

const DottedTable = (props: Props) => {
    return (
        <div className="DottedTable">
            <ul>
                {props.lines.map((line, i) => (
                    <LineItem key={i} line={line} />
                ))}
            </ul>
        </div>
    );
};

export default DottedTable;
