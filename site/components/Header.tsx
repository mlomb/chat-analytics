import { h, Fragment } from 'preact';
import Select from 'antd/lib/select';
import { useState } from 'preact/hooks';

interface ItemProps {
    label: string;
    value: string;
  }
  
  const options: ItemProps[] = [];
  
  for (let i = 10; i < 36; i++) {
    const value = i.toString(36) + i;
    options.push({
      label: `Long Label: ${value}`,
      value,
    });
  }
  
const Header = () => {
    const [value, setValue] = useState(['a10', 'c12', 'h17', 'j19', 'k20']);
  
    const selectProps = {
      mode: 'multiple' as const,
      style: { width: '100%' },
      value,
      options,
      onChange: (newValue: string[]) => {
        setValue(newValue);
      },
      placeholder: 'Select Item...',
      maxTagCount: 'responsive' as const,
    };
  
    return (
        <Select {...selectProps} />
    );
};

export default Header;