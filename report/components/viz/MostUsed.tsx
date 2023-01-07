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
    inFilter(index: Index, filter: RegExp): boolean;
    regexable?: boolean;
}

type Props = SimpleProps | SearchProps;

const MostUsed = (props: Props) => {
    const [filter, setFilter] = useState<string>("");
    let filterFormatted = filter;
    let exactIndex: number = -1;
    const [regexToggled, toggleRegex] = useState<boolean>(false);
    if (props.searchable && !regexToggled) {
        if (props.transformFilter && filter.length !== 0) {
            filterFormatted = matchFormat(props.transformFilter(filter));
        }
        exactIndex = props.indexOf(filterFormatted);
        filterFormatted = filterFormatted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special characters
    }

    let regexSuccessful = true;
    let filterRegex: RegExp;
    try {
        filterRegex = new RegExp(filterFormatted);
    } catch (e) {
        regexSuccessful = false;
    }

    let entries: AnimatedBarEntry[] = [];
    if (regexSuccessful) {
        for (const [i, c] of props.counts.entries()) {
            entries.push({
                index: i,
                value: c,
                pin: exactIndex === i,
            })
        }
        entries = entries.filter(
            (c) =>
                c.value > 0 &&
                (filterFormatted.length === 0 || c.pin || (props.searchable && props.inFilter(c.index, filterRegex))) &&
                (!props.filter || props.filter(c.index))
            )
            .sort((a, b) => b.value - a.value)
            .slice(0, props.maxItems);
    }

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
                <SearchInput
                    placeholder={props.searchPlaceholder}
                    value={filter}
                    onChange={setFilter}
                    regexToggled={regexToggled}
                    onToggleRegex={props.regexable ? toggleRegex : undefined}
                    regexSuccessful={regexSuccessful}
                />
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
