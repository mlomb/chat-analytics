import Select, { CommonProps, components, GroupTypeBase, OptionTypeBase, StylesConfig, Theme } from 'react-select';

interface Option {
    id: string;
    name: string;
};

interface Props<T extends Option> {
    name: string;
    allText: string;
    placeholder: string;
    options: T[];
    selected: T[];
    onChange: (selected: T[]) => void;
};

interface ValueContainerProps extends CommonProps<OptionTypeBase, true, GroupTypeBase<OptionTypeBase>> {
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

const customStyles: StylesConfig<any, true> = {
    option: (provided, state) => ({
        ...provided,
        borderBottom: '1px dotted pink',
        color: state.isSelected ? 'red' : 'blue',
        padding: 20,
    }),
    control: (provided) => ({
        ...provided,
        backgroundColor: '#22292e',
        borderColor: '#596570'
    }),
    singleValue: (provided, state) => {
        const opacity = state.isDisabled ? 0.5 : 1;
        const transition = 'opacity 300ms';

        return { ...provided, opacity, transition };
    }
};

const FilterSelect = <T extends Option>(props: Props<T>) => {
    return <Select
        name={props.name}
        options={props.options}
        placeholder={props.placeholder}
        isMulti={true}
        closeMenuOnSelect={false}
        blurInputOnSelect={false}
        hideSelectedOptions={false}
        components={{ ValueContainer }}
        getOptionValue={option => option.id}
        getOptionLabel={option => option.name}
        defaultValue={props.selected}
        styles={customStyles}
        // @ts-ignore
        onChange={props.onChange}
    />;
};

export default FilterSelect;