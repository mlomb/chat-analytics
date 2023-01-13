/*
    The previous version of this component used react-select with react-window and lots of hacks to make it faster
    In the end, it was replaced by a custom component because react-select uses too much memory.

    If you want to see the react-select version:
    https://github.com/mlomb/chat-analytics/blob/52648937d860412270290d45d3d3cdc93d065536/report/components/FilterSelect.tsx

    Doing this, we lost a lot of accessibility :'(  (I don't know how to do it properly)

    Also, this component was rushed in two days, it may not be pretty

    react-select: https://github.com/JedWatson/react-select
*/

import "@assets/styles/FilterSelect.less";

import React, { PureComponent, ReactElement } from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";

const OPTION_HEIGHT = 35;
const CHIPS_LIMIT = 3;

type Index = number;
type ItemComponent = (props: { index: Index }) => JSX.Element;
type FocusDirection = "up" | "down" | "pageup" | "pagedown" | "first" | "last";

export interface FilterOption {
    name: string | ReactElement;
    options: Index[];
}

interface Props {
    filterOptions: FilterOption[];
    filterSearch: (term: string) => Index[];
    isDisabled: boolean;
    itemComponent: ItemComponent;
    onChange: (selected: Index[]) => void;
    optionColorHue: number;
    options: Index[];
    placeholder: string;
    selected: Index[];
}

interface State {
    inputValue: string;
    isFocused: boolean;
    menuIsOpen: boolean;
    selectedOffset: number;
}

// Options displayed in the control
const ValueOption = ({
    index,
    isDisabled,
    itemComponent,
    onRemove,
}: {
    index: Index;
    isDisabled: boolean;
    itemComponent: ItemComponent;
    onRemove: (index: Index) => void;
}) => {
    const Item = itemComponent;
    const onClick = () => onRemove(index);
    return (
        <div className="FilterSelect__option">
            <div className="FilterSelect__label">
                <Item index={index} />
            </div>
            {!isDisabled && (
                <div className="FilterSelect__remove" onClick={onClick}>
                    <TimesIcon size={14} />
                </div>
            )}
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
            <Item index={props.index} />
        </div>
    );
};

interface ItemData {
    filterOptions: FilterOption[];
    itemComponent: ItemComponent;
    onChange: (selected: Index[]) => void;
    onToggle: (index: Index) => void;
    options: Index[];
    selected: Index[];
    selectedOffset: number;
}

// Selects between DataOptionList and a filter option
const Item = ({ index, style, data }: ListChildComponentProps<ItemData>) => {
    const { filterOptions, itemComponent, onChange, onToggle, options, selected, selectedOffset } = data;

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

export default class FilterSelect extends PureComponent<Props, State> {
    state = {
        inputValue: "",
        isFocused: false,
        menuIsOpen: false,
        selectedOffset: -1,
    };

    private readonly menuRef: React.RefObject<HTMLDivElement>;
    private readonly menuListRef: React.RefObject<FixedSizeList>;
    private readonly inputRef: React.RefObject<HTMLInputElement>;

    private activeOptions: Index[] = [];
    private activeFilterOptions: FilterOption[] = [];
    private totalFocusableOptions: number = 0;

    private scrollToFocusedOptionOnUpdate: boolean = false;

    constructor(props: Props) {
        super(props);

        this.menuRef = React.createRef();
        this.menuListRef = React.createRef();
        this.inputRef = React.createRef();
    }

    componentDidUpdate() {
        if (this.scrollToFocusedOptionOnUpdate && this.menuListRef.current) {
            this.menuListRef.current.scrollToItem(this.state.selectedOffset);
            this.scrollToFocusedOptionOnUpdate = false;
        }
    }

    render(): React.ReactNode {
        const { selectedOffset, menuIsOpen, inputValue } = this.state;
        const {
            filterOptions,
            filterSearch,
            isDisabled,
            itemComponent,
            onChange,
            optionColorHue,
            options,
            placeholder,
            selected,
        } = this.props;

        const cssStyles = { "--hue": optionColorHue } as React.CSSProperties;

        this.activeOptions = inputValue.length === 0 ? options : filterSearch(inputValue);
        this.activeFilterOptions = inputValue.length === 0 ? filterOptions : [];
        this.totalFocusableOptions = this.activeOptions.length + this.activeFilterOptions.length;

        return (
            <div
                className={[
                    "FilterSelect",
                    menuIsOpen ? "FilterSelect--open" : "",
                    isDisabled ? "FilterSelect--disabled" : "",
                ].join(" ")}
                style={cssStyles}
            >
                <div className="FilterSelect__control" onMouseDown={this.onControlMouseDown}>
                    <div className="FilterSelect__options">
                        {selected.slice(0, CHIPS_LIMIT).map((idx) => (
                            <ValueOption
                                key={idx}
                                index={idx}
                                itemComponent={itemComponent}
                                onRemove={this.onToggle}
                                isDisabled={isDisabled}
                            />
                        ))}
                        <div className="FilterSelect__options-shadow"></div>
                    </div>
                    {selected.length > CHIPS_LIMIT && (
                        <div className="FilterSelect__overflow">+{selected.length - CHIPS_LIMIT}</div>
                    )}
                    <input
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect="off"
                        className="FilterSelect__input"
                        disabled={isDisabled}
                        onBlur={this.onInputBlur}
                        onChange={this.handleInputChange}
                        onFocus={this.onInputFocus}
                        onKeyDown={this.onKeyDown}
                        placeholder={selected.length === 0 ? placeholder : ""}
                        ref={this.inputRef}
                        spellCheck="false"
                        tabIndex={0}
                        type="text"
                        value={inputValue}
                    />
                    {!isDisabled && (
                        <div className="FilterSelect__buttons">
                            {selected.length > 0 && (
                                <div className="FilterSelect__clear" onMouseDown={this.onClearIndicatorMouseDown}>
                                    <TimesIcon size={20} />
                                </div>
                            )}
                            <div className="FilterSelect__separator"></div>
                            <div className="FilterSelect__open" onMouseDown={this.onDropdownIndicatorMouseDown}>
                                <OpenIcon />
                            </div>
                        </div>
                    )}
                </div>
                {menuIsOpen && (
                    <div className="FilterSelect__menu" onMouseDown={this.onMenuMouseDown} ref={this.menuRef}>
                        {this.activeOptions.length > 0 ? (
                            <FixedSizeList<ItemData>
                                children={Item}
                                height={Math.min(this.totalFocusableOptions * OPTION_HEIGHT, 300)}
                                initialScrollOffset={0}
                                itemCount={this.totalFocusableOptions}
                                itemData={{
                                    filterOptions: this.activeFilterOptions,
                                    itemComponent,
                                    onChange,
                                    onToggle: this.onToggle,
                                    options: this.activeOptions,
                                    selected,
                                    selectedOffset: selectedOffset,
                                }}
                                itemSize={OPTION_HEIGHT}
                                ref={this.menuListRef}
                                width="100%"
                            />
                        ) : (
                            <div className="FilterSelect__empty">No options</div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // ==============================
    // General Methods
    // ==============================

    onToggle = (index: Index) => {
        const { selected, onChange } = this.props;
        // this is fast enoguh for now
        if (selected.includes(index)) {
            onChange(selected.filter((i) => i !== index));
        } else {
            onChange([...selected, index]);
        }
    };
    selectOption = (offset: number) => {
        if (offset < 0) return;
        const { onToggle, activeOptions, activeFilterOptions } = this;
        const { onChange } = this.props;
        if (offset < activeFilterOptions.length) {
            onChange(activeFilterOptions[offset].options);
        } else {
            onToggle(activeOptions[offset - activeFilterOptions.length]);
        }
    };
    focusInput = () => {
        this.inputRef.current?.focus();
    };
    openMenu = (focusOption: "first" | "last") => {
        const { isFocused } = this.state;
        //let openAtIndex = focusOption === "first" ? 0 : this.totalFocusableOptions - 1;

        // only scroll if the menu isn't already open
        this.scrollToFocusedOptionOnUpdate = !(isFocused && this.menuListRef.current);

        this.setState({
            menuIsOpen: true,
        });
    };
    focusOption = (direction: FocusDirection = "first") => {
        const pageSize = 5;
        const { totalFocusableOptions } = this;
        const { selectedOffset } = this.state;

        if (totalFocusableOptions === 0) return;
        let nextFocus = 0; // handles 'first'
        const focusedIndex = selectedOffset;

        if (direction === "up") {
            nextFocus = focusedIndex > 0 ? focusedIndex - 1 : totalFocusableOptions - 1;
        } else if (direction === "down") {
            nextFocus = (focusedIndex + 1) % totalFocusableOptions;
        } else if (direction === "pageup") {
            nextFocus = focusedIndex - pageSize;
            if (nextFocus < 0) nextFocus = 0;
        } else if (direction === "pagedown") {
            nextFocus = focusedIndex + pageSize;
            if (nextFocus > totalFocusableOptions - 1) nextFocus = totalFocusableOptions - 1;
        } else if (direction === "last") {
            nextFocus = totalFocusableOptions - 1;
        }
        this.scrollToFocusedOptionOnUpdate = true;
        this.setState({ selectedOffset: nextFocus });
    };

    // ==============================
    // Mouse Handlers
    // ==============================

    onMenuMouseDown = (event: React.MouseEvent<HTMLElement>) => {
        if (event.button !== 0) {
            return;
        }
        event.stopPropagation();
        event.preventDefault();
        this.focusInput();
    };
    onControlMouseDown = (event: React.MouseEvent<HTMLElement>) => {
        if (this.props.isDisabled) return;
        // ignore if clicked on a remove button AND the menu was closed
        if (
            !this.state.menuIsOpen &&
            event.target instanceof Element &&
            event.target.closest &&
            event.target.closest(".FilterSelect__remove") !== null
        )
            return;
        if (!this.state.menuIsOpen) {
            this.focusInput();
            this.openMenu("first");
        }
        // only prevent default if NOT clicked in the input
        // (this allows moving the cursor with the mouse)
        // @ts-ignore
        if (event.target.tagName !== "INPUT") {
            event.preventDefault();
        }
    };
    onDropdownIndicatorMouseDown = (event: React.MouseEvent) => {
        // ignore mouse events that weren't triggered by the primary button
        if (event && event.type === "mousedown" && event.button !== 0) {
            return;
        }
        if (this.props.isDisabled) return;
        this.focusInput();
        if (this.state.menuIsOpen) {
            this.setState({ menuIsOpen: false, inputValue: "", selectedOffset: -1 });
        } else {
            this.openMenu("first");
        }
        event.preventDefault();
        event.stopPropagation();
    };
    onClearIndicatorMouseDown = (event: React.MouseEvent) => {
        // ignore mouse events that weren't triggered by the primary button
        if (event && event.type === "mousedown" && event.button !== 0) {
            return;
        }
        this.props.onChange([]);
        event.preventDefault();
        event.stopPropagation();
        this.setState({ menuIsOpen: true, inputValue: "" });
        setTimeout(() => this.focusInput());
    };

    // ==============================
    // Focus Handlers
    // ==============================

    handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) =>
        this.setState({
            menuIsOpen: true,
            inputValue: event.currentTarget.value.toLocaleLowerCase(),
            // reset, so the first option is focused
            selectedOffset: -1,
        });
    onInputFocus = (event: React.FocusEvent<HTMLInputElement>) =>
        this.setState({
            isFocused: true,
        });
    onInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        if (this.menuRef.current && this.menuRef.current.contains(document.activeElement)) {
            this.inputRef.current?.focus();
            return;
        }
        this.setState({
            menuIsOpen: false,
            isFocused: false,
            inputValue: "",
            selectedOffset: -1,
        });
    };

    // ==============================
    // Keyboard Handlers
    // ==============================

    onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (this.props.isDisabled) return;
        const { selectOption, openMenu, focusOption } = this;
        const { menuIsOpen, selectedOffset } = this.state;

        switch (event.key) {
            case "Tab":
                if (event.shiftKey || !menuIsOpen || selectedOffset === -1) {
                    return;
                }
                // select focused option
                selectOption(selectedOffset);
                break;
            case "Enter":
                if (event.keyCode === 229) {
                    // ignore the keydown event from an Input Method Editor(IME)
                    // ref. https://www.w3.org/TR/uievents/#determine-keydown-keyup-keyCode
                    break;
                }
                if (menuIsOpen) {
                    selectOption(selectedOffset);
                    break;
                }
                return;
            case "Escape":
                if (menuIsOpen) {
                    this.setState({ menuIsOpen: false, inputValue: "", selectedOffset: -1 });
                }
                break;
            case " ": // space
                if (!menuIsOpen) {
                    openMenu("first");
                    break;
                }
                return;
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
}

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
