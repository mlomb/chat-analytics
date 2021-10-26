// @ts-nocheck TODO: fix
import React, { ReactNode, ReactNodeArray } from 'react';
import { useMemo } from 'react';
import Select, { CommonProps, components, createFilter, MultiValueProps, OptionProps, StylesConfig, Theme } from 'react-select';
//import { MenuListComponentProps } from 'react-select/src/components/Menu';
import { FixedSizeList as List } from "react-window";

interface Option {
    id: string;
    name: string;
};

interface Props<T extends Option> {
    name: string;
    allText: string;
    placeholder: string;
    optionColorHue: number,
    options: T[];
    selected: T[];
    onChange: (selected: T[]) => void;
    chip: (props: { data: any }) => JSX.Element;
};

interface ValueContainerProps extends CommonProps<any, true, Group> {
    children: any;
};

const ValueContainer = ({ children, ...props }: ValueContainerProps): JSX.Element => {
    if(!props.hasValue) {
        // placeholder and input
        return <components.ValueContainer {...props}>{children}</components.ValueContainer>;
    }

    const CHIPS_LIMIT = 3;
    const [chips, otherChildren] = children;
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

const OptionElement = ({ children, ...props }: OptionProps<any, true>): JSX.Element => {
    return (
      <div style={{ color: 'black'}}>
          <props.selectProps.chip data={props.data} />
      </div>
    )
};

const MultiValue = ({ children, ...props }: MultiValueProps<any>): JSX.Element => {
    console.log(children);
    return (
      <components.MultiValue {...props}>
          <props.selectProps.chip data={props.data} />
      </components.MultiValue>
    );
};

const MenuList = ({ options, children, maxHeight, getValue }: MenuListComponentProps<any, true>): JSX.Element => {
    const childrens = children as ReactNodeArray;
    
    const height = 35;
    const [value] = getValue();
    const initialOffset = options.indexOf(value) * height;

    return (
        <List
            width="100%"
            height={maxHeight}
            itemCount={childrens.length}
            itemSize={height}
            initialScrollOffset={initialOffset}
            >
            {({ index, style }) => <div style={style}>{childrens[index]}</div>}
        </List>
    );
};

const customStyles = (colorHue: number): StylesConfig<any, true> => {
    const accentBorder = `hsl(${colorHue}, 50%, 60%)`;
    const indicatorStyles = {
        ":hover": {
            color: 'white'
        }
    };
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
            backgroundColor: '#1e2529',
            borderColor: state.menuIsOpen ? accentBorder : '#596570',
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
        multiValueRemove: (provided) => ({
            ...provided,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            color: 'white',
            cursor: 'pointer',
            ":hover": {
                backgroundColor: `hsl(${colorHue}deg 100% 75%)`
            }
        }),
        input: (provided) => ({
            ...provided,
            color: 'white',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            ...indicatorStyles
        }),
        clearIndicator: (provided) => ({
            ...provided,
            ...indicatorStyles
        })
    }
};


const Components = {
    MenuList,
    ValueContainer,
    MultiValue,
    Option: OptionElement
};

const filterFn = createFilter({ ignoreAccents: false });

const FilterSelect = <T extends Option>(props: Props<T>) => {
    const Styles = useMemo(() => customStyles(props.optionColorHue), [props.optionColorHue]);

    return <Select
        name={props.name}
        options={props.options}
        placeholder={props.placeholder}
        isMulti={true}
        closeMenuOnSelect={false}
        blurInputOnSelect={false}
        hideSelectedOptions={false}
        components={Components}
        defaultValue={props.selected}
        styles={Styles}
        chip={props.chip}
        filterOption={filterFn}
        isDisabled={props.options.length <= 1}

        // @ts-ignore
        onChange={props.onChange}
    />;
};

export default React.memo(FilterSelect);