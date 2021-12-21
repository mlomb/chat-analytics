/*
    The previous version of this component used react-select with react-window and lots of hacks to make it faster
    In the end, it was replaced by a custom component because react-select uses too much memory.

    If you want to see the react-select version:
    https://github.com/mlomb/chats-analyzer/blob/52648937d860412270290d45d3d3cdc93d065536/report/components/FilterSelect.tsx

    Doing this, we lost a lot of accesibility :'(  (I don't know how to do it properly)
*/

import "@assets/styles/FilterSelect.less";

import React, { memo, useMemo, ReactElement, useCallback, useRef, useState } from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";

const OPTION_HEIGHT = 35;
const CHIPS_LIMIT = 3;

type Index = number;
type ItemComponent = (props: { id: Index }) => JSX.Element;
type ChangeFn = (selected: Index[]) => void;

export interface FilterOption {
    name: string;
    options: Index[];
}

interface Props {
    options: Index[];
    selected: Index[];
    onChange: ChangeFn;
    itemComponent: ItemComponent;
    filterOptions: FilterOption[];
    placeholder: string;
    optionColorHue: number;
}

const ValueOption = ({
    index,
    itemComponent,
    onRemove,
}: {
    index: Index;
    itemComponent: ItemComponent;
    onRemove: (index: Index) => void;
}) => {
    const Item = itemComponent;
    const onClick = (e: React.MouseEvent<HTMLElement>) => {
        // e.preventDefault();
        onRemove(index);
    };
    return (
        <div className="FilterSelect__option">
            <div className="FilterSelect__label">
                <Item id={index} />
            </div>
            <div className="FilterSelect__remove" onClick={onClick}>
                <TimesIcon size={14} />
            </div>
        </div>
    );
};

const DataOptionList = (props: { index: Index; selected: boolean; itemComponent: ItemComponent }) => {
    const Item = props.itemComponent;
    return (
        <div
            // prettier-ignore
            className={[
                "FilterSelect__option-list",
                props.selected ? "FilterSelect__option-list--selected" : ""
            ].join(" ")}
        >
            <Item id={props.index} />
        </div>
    );
};

const FilterSelect = ({ options, selected, filterOptions, onChange, itemComponent, optionColorHue }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);

    const cssStyles = { "--hue": optionColorHue } as React.CSSProperties;

    const doOpen = useCallback(() => setOpen(true), []);
    const doClose = useCallback(() => setOpen(false), []);
    const openSelect = () => {
        doOpen();
        inputRef.current?.focus();
    };

    const onTrigger = useCallback(
        (index: Index) => {
            if (selected.includes(index)) {
                onChange(selected.filter((i) => i !== index));
            } else {
                onChange([...selected, index]);
            }
        },
        [selected, onChange]
    );

    // Selects between DataOptionList and FilterOptionList
    const Item = useMemo(
        () =>
            ({ index, style }: ListChildComponentProps<any>) => {
                const isFilter = index < filterOptions.length;
                let children: ReactElement;

                if (isFilter) {
                    children = <span>{filterOptions[index].name}</span>;
                } else {
                    children = (
                        <DataOptionList
                            index={index - filterOptions.length}
                            // TODO: make sure selected is always sorted and run binary search here
                            selected={selected.includes(index - filterOptions.length)}
                            itemComponent={itemComponent}
                        />
                    );
                }

                const onClick = () => {
                    if (isFilter) {
                        onChange(filterOptions[index].options);
                    } else {
                        onTrigger(index - filterOptions.length);
                    }
                };

                return (
                    <div
                        className={["FilterSelect__item", isFilter ? "FilterSelect__item-filter" : ""].join(" ")}
                        style={{
                            ...style,
                            top: `${parseFloat(style.top + "")}px`,
                            height: `${OPTION_HEIGHT}px`,
                        }}
                        children={children}
                        onClick={onClick}
                    />
                );
            },
        [filterOptions, onChange, itemComponent, onTrigger]
    );

    return (
        <div className={["FilterSelect", open ? "FilterSelect--open" : ""].join(" ")} style={cssStyles}>
            <div className="FilterSelect__control" onClick={openSelect}>
                <div className="FilterSelect__options">
                    {selected.slice(0, CHIPS_LIMIT).map((idx) => (
                        <ValueOption key={idx} index={idx} itemComponent={itemComponent} onRemove={onTrigger} />
                    ))}
                </div>
                {selected.length > CHIPS_LIMIT && (
                    <div className="FilterSelect__overflow">+{selected.length - CHIPS_LIMIT}</div>
                )}
                <div className="FilterSelect__input">
                    <input
                        ref={inputRef}
                        type="text"
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                        tabIndex={0}
                        onFocus={doOpen}
                    />
                </div>
                <div className="FilterSelect__buttons">
                    <div className="FilterSelect__clear">
                        <TimesIcon size={20} />
                    </div>
                    <div className="FilterSelect__separator"></div>
                    <div className="FilterSelect__open">
                        <OpenIcon />
                    </div>
                </div>
            </div>
            {open && (
                <div className="FilterSelect__menu">
                    <FixedSizeList
                        width="100%"
                        height={Math.min((options.length + filterOptions.length) * OPTION_HEIGHT, 300)}
                        itemCount={options.length + filterOptions.length}
                        itemSize={OPTION_HEIGHT}
                        initialScrollOffset={0}
                        children={Item}
                    />
                </div>
            )}
        </div>
    );
};

const TimesIcon = ({ size }: { size: number }) => (
    <svg height={size} width={size} viewBox="0 0 20 20">
        <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
    </svg>
);

const OpenIcon = () => (
    <svg height="20" width="20" viewBox="0 0 20 20">
        <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
    </svg>
);

// export default memo(FilterSelect) as typeof FilterSelect;
export default FilterSelect;
