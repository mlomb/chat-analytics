import CountUp from "react-countup";

import "@assets/styles/AnimatedBars.less";

const ITEM_STRIDE = 40;
const HEADER_HEIGHT = 27; // hmmm
const formattingFn = (n: number) => n.toLocaleString();

type Index = number;
type ItemComponent = (props: { index: Index; pin: boolean }) => JSX.Element;

export interface AnimatedBarEntry {
    index: Index;
    value: number;
    pin?: boolean;
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
}) => (
    <div className="AnimatedBars__item" style={{ top: props.rank * ITEM_STRIDE + "px" }}>
        <div
            className="AnimatedBars__bar"
            style={{
                width: props.percent + "%",
                backgroundColor:
                    props.colorHue === undefined ? `rgba(255, 255, 255, 0.1)` : `hsl(${props.colorHue}, 100%, 65%)`,
            }}
        ></div>
        <div className="AnimatedBars__value">
            <props.itemComponent index={props.entry.index} pin={props.entry.pin || false} />
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

const AnimatedBars = (props: Props) => {
    const sortedById = props.data.slice().sort((a, b) => (a.index > b.index ? 1 : -1));
    const sortedByValue = props.data
        .slice()
        .sort((a, b) => (a.pin === b.pin ? b.value - a.value : +(b.pin || 0) - +(a.pin || 0)));
    const maxValue = sortedByValue.reduce((max, entry) => Math.max(max, entry.value), 0);

    return (
        <div className="AnimatedBars" style={{ minHeight: ITEM_STRIDE * props.maxItems + HEADER_HEIGHT }}>
            <div className="AnimatedBars__header">
                <div>{props.what}</div>
                <div>{props.unit}</div>
            </div>
            <div className="AnimatedBars__body" style={{ minHeight: ITEM_STRIDE * sortedById.length }}>
                {sortedById.map((entry) => (
                    <Item
                        entry={entry}
                        key={entry.index}
                        rank={sortedByValue.indexOf(entry)}
                        percent={Math.max((entry.value / maxValue) * 100, 1)}
                        itemComponent={props.itemComponent}
                        colorHue={props.colorHue}
                    ></Item>
                ))}
            </div>
            <div className="AnimatedBars__footer">
                {sortedById.length === 0
                    ? "No data to show"
                    : sortedById.length < props.maxItems
                    ? "No more entries to show"
                    : ""}
            </div>
        </div>
    );
};

export default AnimatedBars;
