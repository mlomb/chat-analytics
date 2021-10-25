import Select, { CommonProps, components, GroupTypeBase, MultiValueProps, OptionProps, OptionTypeBase, StylesConfig, Theme } from 'react-select';
import { NewChannel } from '../../analyzer/Analyzer';

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

const OptionElement = ({ children, ...props }: OptionProps<any, true>): JSX.Element => {
    return (
      <div style={{ color: 'black'}}>
          <props.selectProps.chip data={props.data} />
      </div>
    )
};

const MultiValue = ({ children, ...props }: MultiValueProps<any>): JSX.Element => {
    return (
      <components.MultiValue {...props}>
          <props.selectProps.chip data={props.data} />
      </components.MultiValue>
    );
};

const customStyles = (props: Props<any>): StylesConfig<any, true> => {
    const accentBorder = `hsl(${props.optionColorHue}, 50%, 60%)`;
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
            //backgroundColor: state.isSelected ? `hsl(${props.optionColorHue}deg 100% 65%)` : 'white',
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
            backgroundColor: `hsl(${props.optionColorHue}deg 100% 65%)`,
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
                backgroundColor: `hsl(${props.optionColorHue}deg 100% 75%)`
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

const FilterSelect = <T extends Option>(props: Props<T>) => {
    return <Select
        name={props.name}
        options={props.options}
        placeholder={props.placeholder}
        isMulti={true}
        closeMenuOnSelect={false}
        blurInputOnSelect={false}
        hideSelectedOptions={false}
        components={{
            ValueContainer,
            MultiValue: MultiValue,
            Option: OptionElement
        }}
        getOptionValue={option => option.id}
        getOptionLabel={option => option.name}
        defaultValue={props.selected}
        styles={customStyles(props)}
        chip={props.chip}

        // @ts-ignore
        onChange={props.onChange}
    />;
};

export default FilterSelect;