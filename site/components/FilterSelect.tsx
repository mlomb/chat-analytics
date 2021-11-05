import { memo, useMemo, ReactNode, useRef, forwardRef, ReactElement } from "react";
import Select, {
    components,
    MenuListProps,
    MultiValueProps,
    OptionProps,
    StylesConfig,
    ValueContainerProps,
} from "react-select";
import memoizeOne from "memoize-one";
import { FilterOptionOption } from "react-select/dist/declarations/src/filters";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { searchFormat } from "../../analyzer/Utils";

const OPTION_HEIGHT = 35;
const MENU_PADDING = 10;

type TOption = {
    id: string;
    name: string;
    name_searchable: string;
};

type ItemComponent = (props: { data: any }) => JSX.Element;

export interface SelectSpecialOpcion<T extends TOption> {
    name: string;
    filter: (options: T[]) => T[];
}

interface Props<T extends TOption> {
    id: string;
    placeholder: string;
    optionColorHue: number;
    options: T[];
    selected: T[];
    onChange: (selected: T[]) => void;
    itemComponent: ItemComponent;
    specialOptions?: SelectSpecialOpcion<T>[];
}

const ValueContainer = (props: ValueContainerProps<TOption, true>): JSX.Element => {
    if (!props.hasValue) {
        // placeholder and input
        return <components.ValueContainer {...props}>{props.children}</components.ValueContainer>;
    }

    const CHIPS_LIMIT = 3;
    const [chips, otherChildren] = props.children as [ReactNode[], ReactNode];
    const overflowCounter = props.getValue().length;
    const displayChips = chips.slice(0, CHIPS_LIMIT);

    return (
        <components.ValueContainer {...props}>
            {displayChips}

            {overflowCounter > CHIPS_LIMIT && `+ ${overflowCounter - CHIPS_LIMIT}`}

            {otherChildren}
        </components.ValueContainer>
    );
};

const Option = (props: OptionProps<TOption, true>): JSX.Element => {
    return (
        <components.Option {...props}>
            <div>
                {/*@ts-ignore*/}
                <props.selectProps.itemComponent data={props.data} />
            </div>
        </components.Option>
    );
};

const MultiValue = (props: MultiValueProps<TOption, true>): JSX.Element => {
    return (
        <components.MultiValue {...props}>
            {/*@ts-ignore*/}
            <props.selectProps.itemComponent data={props.data} />
        </components.MultiValue>
    );
};

// allows padding
const innerElementType = forwardRef(({ style, ...rest }: any, ref) => (
    <div
        ref={ref}
        style={{
            ...style,
            height: `${parseFloat(style.height) + MENU_PADDING * 2}px`,
        }}
        {...rest}
    />
));

// HACK: read below
let lastIndexFocused = -1;

const MenuList = ({
    options,
    children,
    maxHeight,
    selectProps,
    focusedOption,
}: MenuListProps<TOption, true>): JSX.Element => {
    if (!Array.isArray(children)) {
        // NoOptionsMessage
        return <>{children}</>;
    }

    const specialOptions =
        // @ts-ignore
        selectProps.inputValue.length > 0 ? [] : (selectProps.specialOptions as SelectSpecialOpcion<TOption>[]);
    const childrens = children as ReactElement[];

    for (const children of childrens) {
        // NOTE: fix lag
        // see: https://github.com/JedWatson/react-select/issues/3128#issuecomment-442060543
        delete children.props.innerProps.onMouseMove;
        delete children.props.innerProps.onMouseOver;
    }

    // make sure to have the focused option in scroll
    // NOTE: there is a little bug with the scroll and keyboard navigation
    // see: https://github.com/bvaughn/react-window/issues/540
    const listRef = useRef<FixedSizeList>(null);
    const optionIndex = options.indexOf(focusedOption);
    // NOTE: this is a hack to aviod scrolling when props change
    if (lastIndexFocused != optionIndex) {
        listRef.current?.scrollToItem(optionIndex + specialOptions.length);
        lastIndexFocused = optionIndex;
    }

    // NOTE: having the special options not being real options
    // breaks keyboard navigation and accesibility :(
    const SpecialItem = (props: { specialOption: SelectSpecialOpcion<any> }) => {
        const activateFilter = (): void => {
            const filtered = props.specialOption.filter(options as TOption[]);
            // @ts-ignore (dont supply actionMeta)
            selectProps.onChange(filtered);
        };
        return <p onClick={activateFilter}>{props.specialOption.name}</p>;
    };

    const Item = ({ index, style }: ListChildComponentProps<any>) => (
        <div
            style={{
                ...style,
                top: `${parseFloat(style.top + "") + MENU_PADDING}px`,
            }}
        >
            {index < specialOptions.length ? (
                <SpecialItem specialOption={specialOptions[index]} />
            ) : (
                childrens[index - specialOptions.length]
            )}
        </div>
    );

    return (
        <FixedSizeList
            ref={listRef}
            width="100%"
            height={Math.min((childrens.length + specialOptions.length) * OPTION_HEIGHT + 2 * MENU_PADDING, maxHeight)}
            itemCount={childrens.length + specialOptions.length}
            itemSize={OPTION_HEIGHT}
            initialScrollOffset={0}
            innerElementType={innerElementType}
            children={Item}
        />
    );
};

const Components = {
    MenuList,
    MultiValue,
    Option,
    ValueContainer,
};

// I prefer to use @emotion CSS with everything related to react-select
// so no classes are mixed with CSS-in-JS
const customStyles = (colorHue: number): StylesConfig<TOption, true> => {
    const accentBorder = `hsl(${colorHue}, 50%, 60%)`;
    const indicatorStyles = (provided: any, state: any) => ({
        ...provided,
        color: `hsl(0, 0%, ${state.menuIsOpen ? 90 : 80}%)`,
        ":hover": {
            color: "white",
        },
    });
    return {
        option: (_, state) => ({
            height: OPTION_HEIGHT,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            padding: "0 8px",
            backgroundColor: state.isFocused ? `hsl(${colorHue}, 100%, 88%)` : "",
            ":hover": {
                backgroundColor: `hsl(${colorHue}, 100%, 88%)`,
            },
            // option chip
            "> div": {
                color: "white",
                backgroundColor: state.isSelected ? `hsl(${colorHue}, 100%, 65%)` : "#999999",
                padding: 3,
                display: "inline-block",
                borderRadius: 3,
                overflow: "hidden",
            },
        }),
        menu: (provided) => ({
            ...provided,
            // special options
            p: {
                display: "flex",
                alignItems: "center",
                width: "100%",
                height: "100%",
                color: "black",
                padding: "0 10px",
                boxSizing: "border-box",
                cursor: "pointer",
                ": hover": {
                    backgroundColor: "#e5e5e5",
                },
            },
        }),
        control: (provided, state) => ({
            ...provided,
            backgroundColor: state.isDisabled ? "#181c1e" : "#1e2529",
            borderColor: state.isDisabled ? "#373a3d" : state.menuIsOpen ? accentBorder : "#596570",
            ":hover": {
                borderColor: accentBorder,
            },
            boxShadow: state.menuIsOpen ? "0 0 0 1px " + accentBorder : "none",
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: `hsl(${colorHue}deg 100% 65%)`,
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: "white",
        }),
        multiValueRemove: (provided, state) => ({
            ...provided,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            color: "white",
            cursor: "pointer",
            width: state.isDisabled ? 0 : "auto",
            ":hover": {
                backgroundColor: `hsl(${colorHue}deg 100% 75%)`,
            },
        }),
        input: (provided) => ({
            ...provided,
            color: "white",
        }),
        dropdownIndicator: indicatorStyles,
        clearIndicator: indicatorStyles,
    };
};

const memoizedSearchFormat = memoizeOne(searchFormat);
const filterFn = (option: FilterOptionOption<TOption>, candidate: string): boolean =>
    option.data.name_searchable.indexOf(memoizedSearchFormat(candidate)) > -1;

const getOptionValue = (option: TOption) => option.id;
const getOptionLabel = (option: TOption) => option.name;

const FilterSelect = <T extends TOption>(props: Props<T>) => {
    const Styles = useMemo(() => customStyles(props.optionColorHue), [props.optionColorHue]);

    return (
        <Select
            id={props.id}
            options={props.options}
            placeholder={props.placeholder}
            isMulti={true}
            closeMenuOnSelect={false}
            blurInputOnSelect={false}
            hideSelectedOptions={false}
            components={Components}
            defaultValue={props.selected}
            styles={Styles}
            filterOption={filterFn}
            isDisabled={props.options.length <= 1}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            // @ts-ignore
            onChange={props.onChange}
            // custom props
            itemComponent={props.itemComponent}
            specialOptions={props.specialOptions}
        />
    );
};

export default memo(FilterSelect) as typeof FilterSelect;
