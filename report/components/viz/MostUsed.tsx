import { memo, useMemo, useState } from "react";

import { Index } from "@pipeline/Types";
import { matchFormat } from "@pipeline/Text";
import AnimatedBars, { AnimatedBarEntry } from "@report/components/viz/AnimatedBars";
import SearchInput from "@report/components/core/SearchInput";

interface BaseProps {
    what: string;
    unit: string;
    counts: number[];
    filter?: (index: number) => boolean;
    itemComponent: (props: { index: Index }) => JSX.Element;
    maxItems: number;
    colorHue?: number;
}

interface SimpleProps extends BaseProps {
    searchable?: false;
}

interface SearchProps extends BaseProps {
    searchable: true;
    searchPlaceholder: string;
    transformFilter?: (filter: string) => string;
    indexOf: (value: string) => number | -1;
    inFilter(index: Index, filter: string): boolean;
}

type Props = SimpleProps | SearchProps;

const MostUsed = (props: Props) => {
    const [filter, setFilter] = useState<string>("");

    const filterFormatted = matchFormat(
        props.searchable && props.transformFilter ? props.transformFilter(filter) : filter
    );
    let exactIndex =
        filterFormatted.length > 0 && props.counts.length > 0 && props.searchable ? props.indexOf(filterFormatted) : -1;
    let entries: AnimatedBarEntry[] = props.counts.map((c, i) => ({
        index: i,
        value: c,
        pin: exactIndex === i,
    }));
    entries = entries.filter(
        (c) =>
            c.value > 0 &&
            (filterFormatted.length === 0 || c.pin || (props.searchable && props.inFilter(c.index, filterFormatted))) &&
            (!props.filter || props.filter(c.index))
    );
    entries.sort((a, b) => b.value - a.value);
    entries = entries.slice(0, props.maxItems);

    // memo component
    const Item = useMemo(
        () =>
            ({ index, pin }: { index: number; pin: boolean }) => {
                const ItemComponent = props.itemComponent;
                return (
                    <>
                        <ItemComponent index={index} />
                        {pin && <span className="AnimatedBars__exact">EXACT</span>}
                    </>
                );
            },
        [props.itemComponent]
    );

    return (
        <div>
            {props.searchable === true && (
                <SearchInput placeholder={props.searchPlaceholder} value={filter} onChange={setFilter} />
            )}
            <AnimatedBars
                what={props.what}
                unit={props.unit}
                data={entries}
                itemComponent={Item}
                maxItems={props.maxItems}
                colorHue={props.colorHue}
            />
        </div>
    );
};

export default memo(MostUsed) as typeof MostUsed;
