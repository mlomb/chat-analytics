/*
    The previous version of this component used react-select with react-window and lots of hacks to make it faster
    In the end, it was replaced by a custom component because react-select uses too much memory.

    If you want to see the react-select version:
    https://github.com/mlomb/chats-analyzer/blob/52648937d860412270290d45d3d3cdc93d065536/report/components/FilterSelect.tsx

    Doing this, we lost a lot of accesibility :'(  (I don't know how to do it properly)

    Also this component was rushed in two days, it may not be pretty
*/

import "@assets/styles/FilterSelect.less";

import React, { memo, ReactElement, useRef, useState } from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";

const OPTION_HEIGHT = 35;
const CHIPS_LIMIT = 3;

type Index = number;
type ItemComponent = (props: { id: Index }) => JSX.Element;
export type FocusDirection = "up" | "down" | "pageup" | "pagedown" | "first" | "last";

export interface FilterOption {
    name: string;
    options: Index[];
}

interface Props {
    options: Index[];
    selected: Index[];
    onChange: (selected: Index[]) => void;
    itemComponent: ItemComponent;
    filterSearch: (term: string) => Index[];
    filterOptions: FilterOption[];
    placeholder: string;
    optionColorHue: number;
}

// Options displayed in the control
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
    const onClick = () => onRemove(index);
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

// Option displayed in the menu list
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

interface ItemData {
    options: Index[];
    selected: Index[];
    onChange: (selected: Index[]) => void;
    onToggle: (index: Index) => void;
    itemComponent: ItemComponent;
    filterOptions: FilterOption[];
    selectedOffset: number;
}

// Selects between DataOptionList and FilterOptionList
const Item = ({ index, style, data }: ListChildComponentProps<ItemData>) => {
    const { options, filterOptions, selected, itemComponent, onChange, onToggle, selectedOffset } = data;

    const isFilter = index < filterOptions.length;
    let children: ReactElement;

    if (isFilter) {
        children = <span>{filterOptions[index].name}</span>;
    } else {
        const optionIndex = options[index - filterOptions.length];
        children = (
            <DataOptionList
                index={optionIndex}
                // TODO: if this is slow, make sure selected is always sorted and run binary search here
                // for now, its not necessary
                selected={selected.includes(optionIndex)}
                itemComponent={itemComponent}
            />
        );
    }

    const onClick = () => {
        if (isFilter) {
            onChange(filterOptions[index].options);
        } else {
            onToggle(options[index - filterOptions.length]);
        }
    };

    return (
        <div
            className={[
                "FilterSelect__item",
                index === selectedOffset ? "FilterSelect__item--selected" : "",
                isFilter ? "FilterSelect__item-filter" : "",
            ].join(" ")}
            style={style}
            children={children}
            onClick={onClick}
        />
    );
};

const FilterSelect = ({
    options,
    selected,
    filterSearch,
    filterOptions,
    onChange,
    itemComponent,
    placeholder,
    optionColorHue,
}: Props) => {
    const isDisabled = options.length < 2;
    const cssStyles = { "--hue": optionColorHue } as React.CSSProperties;

    // ==============================
    // States
    // ==============================

    const menuRef = useRef<HTMLDivElement>(null);
    const menuListRef = useRef<FixedSizeList>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [state, setState] = useState<{
        isFocused: boolean;
        menuIsOpen: boolean;
        inputValue: string;
        selectedOffset: number;
    }>({
        isFocused: false,
        menuIsOpen: false,
        inputValue: "",
        selectedOffset: -1,
    });
    const updateState = (newState: Partial<typeof state>) => {
        console.log("updateState", newState);
        setState((prevState) => ({ ...prevState, ...newState }));
    };
    const activeOptions = state.inputValue.length === 0 ? options : filterSearch(state.inputValue);
    const activeFilterOptions = state.inputValue.length === 0 ? filterOptions : [];
    const totalFocusableOptions = activeOptions.length + activeFilterOptions.length;

    // ==============================
    // Handlers
    // ==============================

    const onToggle = (index: Index) => {
        // this is fast enoguh for now
        if (selected.includes(index)) {
            onChange(selected.filter((i) => i !== index));
        } else {
            onChange([...selected, index]);
        }
    };
    const openMenu = (focusOption: "first" | "last") => {
        const { isFocused } = state;
        let openAtIndex = focusOption === "first" ? 0 : totalFocusableOptions - 1;

        // only scroll if the menu isn't already open
        let scrollToFocusedOptionOnUpdate = !(isFocused && menuListRef);

        updateState({
            menuIsOpen: true,
            selectedOffset: openAtIndex,
        });
    };
    const focusOption = (direction: FocusDirection = "first") => {
        const pageSize = 5;
        const { selectedOffset } = state;

        if (!options.length) return;
        let nextFocus = 0; // handles 'first'
        let focusedIndex = selectedOffset;

        if (direction === "up") {
            nextFocus = focusedIndex > 0 ? focusedIndex - 1 : options.length - 1;
        } else if (direction === "down") {
            nextFocus = (focusedIndex + 1) % options.length;
        } else if (direction === "pageup") {
            nextFocus = focusedIndex - pageSize;
            if (nextFocus < 0) nextFocus = 0;
        } else if (direction === "pagedown") {
            nextFocus = focusedIndex + pageSize;
            if (nextFocus > options.length - 1) nextFocus = options.length - 1;
        } else if (direction === "last") {
            nextFocus = options.length - 1;
        }
        let scrollToFocusedOptionOnUpdate = true;

        updateState({ selectedOffset: nextFocus });
    };

    // ==============================
    // Mouse Handlers
    // ==============================

    const onMenuMouseDown = (event: React.MouseEvent<HTMLElement>) => {
        if (event.button !== 0) {
            return;
        }
        event.stopPropagation();
        event.preventDefault();
        inputRef.current?.focus();
    };
    const onControlMouseDown = (event: React.MouseEvent<HTMLElement>) => {
        console.log("onControlMouseDown");

        if (!state.menuIsOpen) {
            inputRef.current?.focus();
            updateState({ menuIsOpen: true });
        }
        // only prevent default if NOT clicked in the input
        // @ts-ignore
        if (event.target.tagName !== "INPUT") {
            event.preventDefault();
        }
    };
    const onDropdownIndicatorMouseDown = (event: React.MouseEvent) => {
        // ignore mouse events that weren't triggered by the primary button
        if (event && event.type === "mousedown" && event.button !== 0) {
            return;
        }
        if (isDisabled) return;
        inputRef.current?.focus();
        updateState({ menuIsOpen: !state.menuIsOpen });
        event.preventDefault();
        event.stopPropagation();
    };
    const onClearIndicatorMouseDown = (event: React.MouseEvent) => {
        // ignore mouse events that weren't triggered by the primary button
        if (event && event.type === "mousedown" && event.button !== 0) {
            return;
        }
        onChange([]);
        event.preventDefault();
        event.stopPropagation();
        updateState({ menuIsOpen: true, inputValue: "" });
        if (event.type === "touchend") {
            inputRef.current?.focus();
        } else {
            setTimeout(() => inputRef.current?.focus());
        }
    };

    // ==============================
    // Focus Handlers
    // ==============================

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("handleInputChange");
        updateState({
            menuIsOpen: true,
            inputValue: event.currentTarget.value.toLocaleLowerCase(),
        });
    };
    const onInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        console.log("onInputFocus");
        updateState({ isFocused: true });
    };
    const onInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        console.log("onInputBlur");

        if (menuRef.current && menuRef.current.contains(document.activeElement)) {
            console.log("was inside");
            inputRef.current?.focus();
            return;
        }
        updateState({ menuIsOpen: false, isFocused: false, inputValue: "" });
    };

    // ==============================
    // Keyboard Handlers
    // ==============================

    const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (isDisabled) return;
        const { menuIsOpen } = state;

        switch (event.key) {
            case "Tab":
                /*
                if (isComposing) return;

                if (
                    event.shiftKey ||
                    !menuIsOpen ||
                    !tabSelectsValue ||
                    !focusedOption ||
                    // don't capture the event if the menu opens on focus and the focused
                    // option is already selected; it breaks the flow of navigation
                    (openMenuOnFocus && isOptionSelected(focusedOption, selectValue))
                ) {
                    return;
                }
                selectOption(focusedOption);
                */
                break;
            case "Enter":
                if (event.keyCode === 229) {
                    // ignore the keydown event from an Input Method Editor(IME)
                    // ref. https://www.w3.org/TR/uievents/#determine-keydown-keyup-keyCode
                    break;
                }
                //    if (menuIsOpen) {
                //        if (!focusedOption) return;
                //        if (isComposing) return;
                //        selectOption(focusedOption);
                //        break;
                //    }
                return;
            case "Escape":
                if (menuIsOpen) {
                    updateState({ menuIsOpen: false, inputValue: "" });
                }
                break;
            //case " ": // space
            //    if (inputValue) {
            //        return;
            //    }
            //    if (!menuIsOpen) {
            //        openMenu("first");
            //        break;
            //    }
            //    if (!focusedOption) return;
            //    selectOption(focusedOption);
            //    break;
            case "ArrowUp":
                if (menuIsOpen) {
                    focusOption("up");
                } else {
                    openMenu("last");
                }
                break;
            case "ArrowDown":
                if (menuIsOpen) {
                    focusOption("down");
                } else {
                    openMenu("first");
                }
                break;
            case "PageUp":
                if (!menuIsOpen) return;
                focusOption("pageup");
                break;
            case "PageDown":
                if (!menuIsOpen) return;
                focusOption("pagedown");
                break;
            case "Home":
                if (!menuIsOpen) return;
                focusOption("first");
                break;
            case "End":
                if (!menuIsOpen) return;
                focusOption("last");
                break;
            default:
                return;
        }
        event.preventDefault();
    };

    return (
        <div className={["FilterSelect", state.menuIsOpen ? "FilterSelect--open" : ""].join(" ")} style={cssStyles}>
            <div className="FilterSelect__control" onMouseDown={onControlMouseDown}>
                <div className="FilterSelect__options">
                    {selected.slice(0, CHIPS_LIMIT).map((idx) => (
                        <ValueOption key={idx} index={idx} itemComponent={itemComponent} onRemove={onToggle} />
                    ))}
                    <div className="FilterSelect__options-shadow"></div>
                </div>
                {selected.length > CHIPS_LIMIT && (
                    <div className="FilterSelect__overflow">+{selected.length - CHIPS_LIMIT}</div>
                )}
                <input
                    className="FilterSelect__input"
                    ref={inputRef}
                    type="text"
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    tabIndex={0}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                    onKeyDown={onKeyDown}
                    onChange={handleInputChange}
                    value={state.inputValue}
                    placeholder={selected.length === 0 ? placeholder : ""}
                />
                <div className="FilterSelect__buttons">
                    <div className="FilterSelect__clear" onMouseDown={onClearIndicatorMouseDown}>
                        <TimesIcon size={20} />
                    </div>
                    <div className="FilterSelect__separator"></div>
                    <div className="FilterSelect__open" onMouseDown={onDropdownIndicatorMouseDown}>
                        <OpenIcon />
                    </div>
                </div>
            </div>
            {state.menuIsOpen && (
                <div className="FilterSelect__menu" onMouseDown={onMenuMouseDown} ref={menuRef}>
                    {activeOptions.length > 0 ? (
                        <FixedSizeList<ItemData>
                            ref={menuListRef}
                            width="100%"
                            height={Math.min(totalFocusableOptions * OPTION_HEIGHT, 300)}
                            itemCount={totalFocusableOptions}
                            itemSize={OPTION_HEIGHT}
                            initialScrollOffset={0}
                            children={Item}
                            itemData={{
                                filterOptions: activeFilterOptions,
                                options: activeOptions,
                                selected,
                                itemComponent,
                                onChange,
                                onToggle,
                                selectedOffset: state.selectedOffset,
                            }}
                        />
                    ) : (
                        <div className="FilterSelect__empty">No options</div>
                    )}
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

export default memo(FilterSelect) as typeof FilterSelect;
