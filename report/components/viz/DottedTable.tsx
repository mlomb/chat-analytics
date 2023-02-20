import { ReactElement } from "react";
import CountUp from "react-countup";

import { Tooltip } from "@report/components/core/Tooltip";

import InfoIcon from "@assets/images/icons/info.svg";
import "@assets/styles/DottedTable.less";

interface SeparatorLine {
    type: "separator";
}

interface TitleLine {
    type: "title";
}

interface TextLine {
    type: "text";
    value?: string;
}

interface NumberLine {
    type: "number";
    formatter: "integer" | "decimal" | "time" | ((n: number) => string);
    value?: number;
}

export type Line =
    | SeparatorLine
    | ((NumberLine | TextLine | TitleLine) & {
          label: string;
          tooltip?: ReactElement | string;
          depth?: number;
      });

interface Props {
    lines: Line[];
}

const numberFormatterFns = {
    integer: (n: number) => Math.round(n).toLocaleString(),
    decimal: (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    time: (n: number) => {
        // expected formats:
        // XXd XXh
        // XXh XXm
        // XXm XXs
        // XX seconds

        const days = Math.floor(n / (24 * 60 * 60));
        const hours = Math.floor((n % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((n % (60 * 60)) / 60);
        const seconds = Math.floor(n % 60);
        let result = "";
        let unitsShown = 0;

        if (days > 0) {
            result += days + "d ";
            unitsShown++;
        }
        if (hours > 0) {
            result += hours + "h ";
            unitsShown++;
        }
        if (unitsShown < 2 && minutes > 0) {
            result += minutes + "m ";
            unitsShown++;
        }
        if (unitsShown < 2 && seconds > 0) {
            result += seconds + (unitsShown > 0 ? "s" : " seconds");
            unitsShown++;
        }
        if (unitsShown === 0) {
            result += "0 seconds";
        }

        return result.trim();
    },
};

const LineItem = ({ line }: { line: Line }) => {
    if (line.type === "separator") {
        return <div className="DottedTable__separator" />;
    } else if (line.type === "title") {
        return <span className="DottedTable__title" title={line.label} children={line.label} />;
    }

    const depth = line.depth || 0;

    let value: JSX.Element;
    switch (line.type) {
        case "text":
            value = <>{line.value}</>;
            break;
        case "number":
            value = (
                <CountUp
                    end={line.value || 0}
                    duration={0.2}
                    preserveValue
                    decimals={2}
                    formattingFn={
                        typeof line.formatter === "string" ? numberFormatterFns[line.formatter] : line.formatter
                    }
                />
            );
            break;
    }

    const valueContainer = (
        <span className="DottedTable__value" style={{ fontWeight: depth === 0 ? "bold" : undefined }}>
            {line.tooltip ? <img src={InfoIcon} height={16} /> : null}
            {value}
        </span>
    );

    return (
        <li style={{ paddingLeft: 20 * depth, color: depth === 1 ? "#c7c7c7" : undefined }}>
            <span className="DottedTable__label" title={line.label} children={line.label} />
            {line.tooltip ? <Tooltip content={line.tooltip} children={valueContainer} /> : valueContainer}
        </li>
    );
};

const DottedTable = (props: Props) => (
    <div className="DottedTable">
        <ul>
            {props.lines.map((line, i) => (
                <LineItem key={i} line={line} />
            ))}
        </ul>
    </div>
);

export default DottedTable;
