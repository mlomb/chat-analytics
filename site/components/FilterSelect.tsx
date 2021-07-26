import Select, { CommonProps, components, GroupTypeBase, OptionTypeBase, Theme } from 'react-select';

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

const selectTheme = (theme: Theme): Theme => ({
    ...theme,
    colors: {
        ...theme.colors,
        
        /*
        * multiValue(remove)/color:hover
        */
        danger: 'purple',

        /*
        * multiValue(remove)/backgroundColor(focused)
        * multiValue(remove)/backgroundColor:hover
        */
        dangerLight: "magenta",

        /*
        * control/backgroundColor
        * menu/backgroundColor
        * option/color(selected)
        */
        neutral0: "#0e0e0e",

        /*
        * control/backgroundColor(disabled)
        */
        neutral5: "orange",

        /*
        * control/borderColor(disabled)
        * multiValue/backgroundColor
        * indicators(separator)/backgroundColor(disabled)
        */
        neutral10: 'pink',

        /*
        * control/borderColor
        * option/color(disabled)
        * indicators/color
        * indicators(separator)/backgroundColor
        * indicators(loading)/color
        */
        neutral20: "#272727",

        /*
        * control/borderColor(focused)
        * control/borderColor:hover
        */
        // this should be the white, that's normally selected
        neutral30: "magenta",

        /*
        * menu(notice)/color
        * singleValue/color(disabled)
        * indicators/color:hover
        */
        neutral40: 'green',

        /*
        * placeholder/color
        */
        // seen in placeholder text
        neutral50: "magenta",

        /*
        * indicators/color(focused)
        * indicators(loading)/color(focused)
        */
        neutral60: 'purple',
        neutral70: 'purple',

        /*
        * input/color
        * multiValue(label)/color
        * singleValue/color
        * indicators/color(focused)
        * indicators/color:hover(focused)
        */
        neutral80: "magenta",

        // no idea
        neutral90: "pink",

        /*
        * control/boxShadow(focused)
        * control/borderColor(focused)
        * control/borderColor:hover(focused)
        * option/backgroundColor(selected)
        * option/backgroundColor:active(selected)
        */
        primary: "magenta",

        /*
        * option/backgroundColor(focused)
        */
        primary25: "magenta",

        /*
        * option/backgroundColor:active
        */
        primary50: "magenta",
        primary75: "magenta",
    }
});

const FilterSelect = <T extends Option>(props: Props<T>) => {
    return <Select
        name={props.name}
        options={props.options}
        placeholder={props.placeholder}
        isMulti={true}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        components={{ ValueContainer }}
        getOptionValue={option => option.id}
        getOptionLabel={option => option.name}
        defaultValue={props.selected}
        theme={selectTheme}
        // @ts-ignore
        onChange={props.onChange}
    />;
};

export default FilterSelect;