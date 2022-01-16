import "@assets/styles/DottedTable.less";
import CountUp from "react-countup";
import Tooltip from "@report/components/core/Tooltip";

import InfoIcon from "@assets/images/icons/info.svg";

interface NumberLine {
    type: "number";
    formatter: "integer" | "decimal" | "time";
    value?: number;
}

export type Line = NumberLine & {
    label: string;
    tooltip?: string;
    depth?: number;
};

interface Props {
    lines: Line[];
}

const numberFormatterFns = {
    integer: (n: number) => Math.round(n).toLocaleString(),
    decimal: (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    time: (n: number) => {
        const hours = Math.max(n / 3600, 0);
        if (hours > 72) {
            return numberFormatterFns.decimal(hours / 24) + " days";
        } else {
            return numberFormatterFns.decimal(hours) + " hours";
        }
    },
};

const LineItem = ({ line }: { line: Line }) => {
    const depth = line.depth || 0;

    let value: JSX.Element;
    switch (line.type) {
        case "number":
            value = (
                <CountUp
                    end={line.value || 0}
                    duration={0.2}
                    preserveValue
                    decimals={2}
                    formattingFn={numberFormatterFns[line.formatter]}
                />
            );
            break;
    }

    return (
        <li style={{ paddingLeft: 20 * depth, color: depth === 1 ? "#c7c7c7" : undefined }}>
            <span className="DottedTable__key">{line.label}</span>
            <span className="DottedTable__value" style={{ fontWeight: depth === 0 ? "bold" : undefined }}>
                {line.tooltip && (
                    <div className="TooltipWrapper">
                        <Tooltip content={line.tooltip} position="left">
                            <img src={InfoIcon} height={16} />
                        </Tooltip>
                    </div>
                )}
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
