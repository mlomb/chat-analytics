import "@assets/styles/AnimatedBars.less";

import CountUp from "react-countup";

const ITEM_STRIDE = 40;
const formattingFn = (n: number) => n.toLocaleString();

type Index = number;
type ItemComponent = (props: { id: Index }) => JSX.Element;

export interface AnimatedBarEntry {
    id: Index;
    value: number;
}

interface Props {
    colorHue?: number;
    data: AnimatedBarEntry[];
    itemComponent: ItemComponent;
    maxItems: number;
    unit: string;
    what: string;
}

const Item = (props: {
    colorHue?: number;
    entry: AnimatedBarEntry;
    itemComponent: ItemComponent;
    percent: number;
    rank: number;
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
                <props.itemComponent id={props.entry.id} />
            </div>
            <CountUp
                className="AnimatedBars__unit"
                preserveValue
                delay={0}
                duration={0.5}
                end={props.entry.value}
                formattingFn={formattingFn}
            />
        </div>
    );
};

const AnimatedBars = (props: Props) => {
    const sortedById = props.data.slice().sort((a, b) => (a.id > b.id ? 1 : -1));
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
                        key={entry.id}
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
