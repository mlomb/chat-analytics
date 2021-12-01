import "@assets/styles/AnimatedBars.less";

import CountUp from "react-countup";

const ITEM_STRIDE = 40;

export interface AnimatedBarEntry {
    data: {
        id: string | number;
    };
    value: number;
}

interface Props {
    what: string;
    unit: string;
    data: AnimatedBarEntry[];
    maxItems: number;
    itemComponent: (props: { data: any }) => JSX.Element;
    colorHue?: number;
}

const Item = (props: {
    itemComponent: (props: { data: any }) => JSX.Element;
    colorHue?: number;
    entry: AnimatedBarEntry;
    rank: number;
    percent: number;
}) => {
    return (
        <div className="AnimatedBars__item" style={{ top: props.rank * ITEM_STRIDE + "px" }}>
            <div
                className="AnimatedBars__bar"
                style={{
                    width: props.percent + "%",
                    backgroundColor:
                        props.colorHue !== undefined ? `hsl(${props.colorHue}, 100%, 65%)` : `rgba(255, 255, 255, 0.1)`,
                }}
            ></div>
            <div className="AnimatedBars__value">
                <props.itemComponent data={props.entry.data} />
            </div>
            <CountUp className="AnimatedBars__unit" preserveValue delay={0} duration={0.5} end={props.entry.value} />
        </div>
    );
};

const AnimatedBars = (props: Props) => {
    const sortedById = props.data.slice().sort((a, b) => (a.data.id > b.data.id ? 1 : -1));
    const sortedByValue = props.data.slice().sort((a, b) => b.value - a.value);
    const maxValue = sortedByValue.length ? sortedByValue[0].value : 0;

    return (
        <div className="AnimatedBars">
            <div className="AnimatedBars__header">
                <div>{props.what}</div>
                <div>{props.unit}</div>
            </div>
            <div className="AnimatedBars__body" style={{ minHeight: ITEM_STRIDE * sortedById.length }}>
                {sortedById.map((entry) => (
                    <Item
                        entry={entry}
                        key={entry.data.id}
                        rank={sortedByValue.indexOf(entry)}
                        percent={(entry.value / maxValue) * 100}
                        itemComponent={props.itemComponent}
                        colorHue={props.colorHue}
                    ></Item>
                ))}
            </div>
        </div>
    );
};

export default AnimatedBars;
