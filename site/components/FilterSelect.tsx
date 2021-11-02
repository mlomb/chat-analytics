import React, { useMemo, ReactNode } from 'react';
import Select, { CommonProps, components, GroupBase, MenuListProps, MultiValueProps, OptionProps, StylesConfig, ValueContainerProps } from 'react-select';
import { FilterOptionOption } from 'react-select/dist/declarations/src/filters';
import { FixedSizeList as List } from "react-window";

interface TOption {
    id: string;
    name: string;
    name_searchable?: string; // TODO: remove ?
};

type ItemComponent = (props: { data: any }) => JSX.Element;

interface Props<T extends TOption> {
    placeholder: string;
    optionColorHue: number;
    options: T[];
    selected: T[];
    onChange: (selected: T[]) => void;
    itemComponent: ItemComponent;
};

const ValueContainer = (props: ValueContainerProps<TOption, true>): JSX.Element => {
    if(!props.hasValue) {
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
        <div style={{ color: 'black'}}>
            {/*@ts-ignore*/}
            <props.selectProps.itemComponent data={props.data} />
        </div>
    )
};

const MultiValue = (props: MultiValueProps<TOption, true>): JSX.Element => {
    return (
        <components.MultiValue {...props}>
            {/*@ts-ignore*/}
            <props.selectProps.itemComponent data={props.data} />
        </components.MultiValue>
    );
};

const MenuList = ({ options, children, maxHeight, getValue }: MenuListProps<TOption, true>): JSX.Element => {
    if(!Array.isArray(children)) {
        // NoOptionsMessage
        return <>{children}</>;
    }

    const childrens = children as ReactNode[];
    
    const height = 35;
    const [value] = getValue();
    const initialOffset = options.indexOf(value) * height;

    return (
        <List
            width="100%"
            height={Math.min(childrens.length * height, maxHeight)}
            itemCount={childrens.length}
            itemSize={height}
            initialScrollOffset={initialOffset}
        >
            {({ index, style }) => <div style={style}>{childrens[index]}</div>}
        </List>
    );
};

const Components = {
    MenuList,
    MultiValue,
    Option,
    ValueContainer
};

const customStyles = (colorHue: number): StylesConfig<any, true> => {
    const accentBorder = `hsl(${colorHue}, 50%, 60%)`;
    const indicatorStyles = (provided: any, state: any) => ({
        ...provided,
        color: `hsl(0, 0%, ${state.menuIsOpen ? 90 : 80}%)`,
        ":hover": {
            color: 'white'
        }
    });
    return {
        menu: (provided) => ({
            ...provided,
            //backgroundColor: '#66696b',
        }),
        option: (provided, state) => ({
            ...provided,
            //backgroundColor: state.isSelected ? `hsl(${colorHue}deg 100% 65%)` : 'white',
            //color: state.isSelected ? 'white' : 'black',
        }),
        control: (provided, state) => ({
            ...provided,
            backgroundColor: state.isDisabled ? '#181c1e' : '#1e2529',
            borderColor: state.isDisabled ? '#373a3d' : (state.menuIsOpen ? accentBorder : '#596570'),
            ":hover": {
                borderColor: accentBorder,
            },
            boxShadow: state.menuIsOpen ? '0 0 0 1px ' + accentBorder : 'none',
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: `hsl(${colorHue}deg 100% 65%)`,
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: 'white',
        }),
        multiValueRemove: (provided, state) => ({
            ...provided,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            color: 'white',
            cursor: 'pointer',
            width: state.isDisabled ? 0 : 'auto',
            ":hover": {
                backgroundColor: `hsl(${colorHue}deg 100% 75%)`
            }
        }),
        input: (provided) => ({
            ...provided,
            color: 'white',
        }),
        dropdownIndicator: indicatorStyles,
        clearIndicator: indicatorStyles
    }
};

const filterFn = (option: FilterOptionOption<TOption>, candidate: string):
    // TODO: use name_searchable
    // TODO: also satinize candidate
    boolean => option.data.name!.indexOf(candidate) > -1;

const getOptionValue = (option: TOption) => option.id;
const getOptionLabel = (option: TOption) => option.name;

const FilterSelect = <T extends TOption>(props: Props<T>) => {
    const Styles = useMemo(() => customStyles(props.optionColorHue), [props.optionColorHue]);

    return <Select
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
        itemComponent={props.itemComponent}
        // @ts-ignore
        onChange={props.onChange}
    />;
};

export default React.memo(FilterSelect);