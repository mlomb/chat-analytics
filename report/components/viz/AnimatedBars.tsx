import { useEffect } from "react";
import CountUp from "react-countup";

import "@assets/styles/AnimatedBars.less";

const ITEM_STRIDE = 40;
const HEADER_HEIGHT = 27; // hmmm

const defaultFormatting = (n: number) => n.toLocaleString();

type Index = number;
type ItemComponent = (props: { index: Index; pin: boolean }) => JSX.Element;

export interface AnimatedBarEntry {
    index: Index;
    value: number;
    pin?: boolean;
}

export interface SelectedBarEntry {
    index: Index;
    manual: boolean;
}

interface Props {
    /** It should have less than `maxItems` items. The component DOES NOT slice the data. */
    data: AnimatedBarEntry[];
    colorHue?: number;
    itemComponent: ItemComponent;
    maxItems: number;
    unit: string;
    what: string;
    maxValue?: number;
    formatNumber?: (n: number) => string;

    selectable?: boolean;
    selected?: SelectedBarEntry;
    onSelectChange?: (sel: SelectedBarEntry) => void;
}

const Item = (props: {
    colorHue?: number;
    entry: AnimatedBarEntry;
    itemComponent: ItemComponent;
    percent: number;
    rank: number;
    formatNumber?: (n: number) => string;
    selectable: boolean;
    selected: boolean;
    onSelectChange?: (sel: SelectedBarEntry) => void;
}) => (
    <div
        className="AnimatedBars__item"
        style={{ top: props.rank * ITEM_STRIDE + "px", cursor: props.selectable ? "pointer" : "default" }}
        onClick={() => props.onSelectChange && props.onSelectChange({ index: props.entry.index, manual: true })}
    >
        <div
            className="AnimatedBars__bar"
            style={{
                width: props.percent + "%",
                backgroundColor: props.selected
                    ? `#2f8f79`
                    : props.colorHue === undefined
                    ? `rgba(255, 255, 255, 0.1)`
                    : `hsl(${props.colorHue}, 100%, 65%)`,
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
            formattingFn={props.formatNumber}
        />
    </div>
);

const AnimatedBars = (props: Props) => {
    const sortedById = props.data.slice().sort((a, b) => (a.index > b.index ? 1 : -1));
    const sortedByValue = props.data
        .slice()
        .sort((a, b) => (a.pin === b.pin ? b.value - a.value : +(b.pin || 0) - +(a.pin || 0)));
    const maxValue =
        props.maxValue !== undefined
            ? props.maxValue
            : sortedByValue.reduce((max, entry) => Math.max(max, entry.value), 0);

    useEffect(() => {
        if (!props.selectable) return;
        if (props.onSelectChange === undefined) return;
        if (sortedByValue.length === 0) return; // no item to select

        const topEntry = sortedByValue[0];
        const selected = sortedByValue.find((entry) => entry.index === props.selected?.index);

        if (
            // selection lost
            // reset selection to the first item
            selected === undefined ||
            // change selection ONLY IF the current selection has not been set manually
            (props.selected && !props.selected.manual)
        ) {
            if (topEntry !== selected)
                // and don't change if don't have to (avoid infinite loop)
                props.onSelectChange({
                    index: topEntry.index,
                    manual: false,
                });
        }
    }, [props.data, props.selected]);

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
                        formatNumber={props.formatNumber || defaultFormatting}
                        selectable={props.selectable === true}
                        selected={props.selected?.index === entry.index}
                        onSelectChange={props.onSelectChange}
                    ></Item>
                ))}
            </div>
            <div className="AnimatedBars__footer">
                {sortedById.length === 0
                    ? "No data to show"
                    : sortedById.length < props.maxItems
                    ? "No more entries to show"
                    : undefined}
            </div>
        </div>
    );
};

export default AnimatedBars;
