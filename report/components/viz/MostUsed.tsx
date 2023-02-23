import { memo, useMemo, useState } from "react";

import { Index } from "@pipeline/Types";
import { matchFormat } from "@pipeline/process/nlp/Text";
import SearchInput from "@report/components/core/SearchInput";
import AnimatedBars, { AnimatedBarEntry } from "@report/components/viz/AnimatedBars";

interface BaseProps {
    what: string;
    unit: string;
    counts?: number[];
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
    inFilter(index: Index, filter: string | RegExp): boolean;
    allowRegex?: boolean;
}

type Props = SimpleProps | SearchProps;

const EmptyArray: number[] = [];

const MostUsed = (props: Props) => {
    const [filter, setFilter] = useState<string | RegExp>("");

    let finalFilter: string | RegExp = filter;
    let exactIndex: number = -1;

    if (props.searchable && !(filter instanceof RegExp)) {
        // string
        finalFilter = matchFormat(props.transformFilter ? props.transformFilter(filter) : filter);
        exactIndex = props.indexOf(finalFilter);
    }

    let entries: AnimatedBarEntry[] = [];
    for (const [i, c] of (props.counts || EmptyArray).entries()) {
        entries.push({
            index: i,
            value: c,
            pin: exactIndex === i,
        });
    }
    entries = entries
        .filter(
            (c) =>
                c.value > 0 &&
                (filter === "" || c.pin || (props.searchable && props.inFilter(c.index, finalFilter))) &&
                (!props.filter || props.filter(c.index))
        )
        .sort((a, b) => b.value - a.value)
        .slice(0, props.maxItems);

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
        <>
            {props.searchable === true && (
                <SearchInput placeholder={props.searchPlaceholder} onChange={setFilter} allowRegex={props.allowRegex} />
            )}
            <AnimatedBars
                what={props.what}
                unit={props.unit}
                data={entries}
                itemComponent={Item}
                maxItems={props.maxItems}
                colorHue={props.colorHue}
            />
        </>
    );
};

export default memo(MostUsed) as typeof MostUsed;
