import "@assets/styles/SearchInput.less";

interface Props {
    value: string;
    onChange: (value: string) => void;
    regexToggled: boolean;
    onToggleRegex?: (value: boolean) => void;
    placeholder?: string;
    regexSuccessful?: boolean;
}

const SearchInput = ({ value, placeholder, onChange, onToggleRegex, regexToggled, regexSuccessful }: Props) => (
    <div className="SearchInput">
        <div className="SearchInput__mag"></div>
        <input
            className={["SearchInput__input", regexSuccessful ? "" : "SearchInput__input--error"].join(" ")}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
        />
        {onToggleRegex && (
            <input
                className="SearchInput__regex-toggle"
                type="checkbox"
                onChange={e => onToggleRegex(e.target.checked)}
                checked={regexToggled}
            />
        )}
    </div>
);

export default SearchInput;
