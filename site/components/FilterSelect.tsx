import Select from 'react-select';

interface Option {
    id: string;
    name: string;
};

interface Props<T extends Option> {
    allText: string;
    placeholder: string;
    options: T[];
    selected: T[];
    onChange: (selected: T[]) => void;
};

const FilterSelect = <T extends Option>(props: Props<T>) => {
    return <Select
        options={props.options}
        placeholder={props.placeholder}
        isMulti={true}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        getOptionValue={option => option.id}
        getOptionLabel={option => option.name}
        defaultValue={props.selected}
        // @ts-ignore
        onChange={props.onChange}
    />;
};

export default FilterSelect;