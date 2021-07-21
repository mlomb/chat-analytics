import { useEffect, useState } from 'react';

import Select, { Props as SelectProps } from 'react-select';

interface Props {
    allText: string;
    placeholder: string;
    options: {
        [key: string]: {
            name: string;
        };
    }
};

const FilterSelect = (props: Props) => {
    const [options, setOptions] = useState<any[]>([]);

    useEffect(() => {
        setOptions(Object.entries(props.options).map(entry => ({
            value: entry[0],
            label: entry[1].name
        })));
    }, [props.options]);

    return <Select
        options={options}
        placeholder={props.placeholder}
        isMulti={true}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
    />;

};

export default FilterSelect;