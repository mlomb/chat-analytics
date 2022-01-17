import "@assets/styles/SearchInput.less";

interface Props {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const SearchInput = ({ value, placeholder, onChange }: Props) => {
    return (
        <div className="SearchInput">
            <div className="SearchInput__mag"></div>
            <input
                className="SearchInput__input"
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export default SearchInput;
