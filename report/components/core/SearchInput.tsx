import "@assets/styles/SearchInput.less";

import { useRef, useState } from "react";

import { Tooltip } from "@report/components/core/Tooltip";

interface Props {
    placeholder?: string;
    allowRegex?: boolean;
    onChange: (value: string | RegExp) => void;
}

const SearchInput = ({ onChange, placeholder, allowRegex }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const [input, setInput] = useState<string>(""); // true text value of input
    const [error, setError] = useState<boolean>(false);
    const [regexEnabled, setRegexEnabled] = useState<boolean>(false);

    const onInputChanged = (value: string, _regexEnabled: boolean) => {
        setInput(value);

        if (allowRegex && _regexEnabled) {
            // try to parse input as regular expression
            try {
                const expr = new RegExp(value, "ui");
                onChange(expr);
                setError(false);
            } catch (e) {
                // invalid regex
                // pass never matching regex and show error
                onChange(/[]/);
                setError(true);
            }
        } else {
            // pass text directly
            onChange(value);
            setError(false);
        }
    };

    const onToggleRegex = (enabled: boolean) => {
        setRegexEnabled(enabled);
        onInputChanged(input, enabled);

        // always give the focus back to the input
        inputRef.current?.focus();
    };

    return (
        <div className="SearchInput">
            <div className="SearchInput__mag"></div>
            <input
                ref={inputRef}
                className={[
                    "SearchInput__input",
                    allowRegex ? "SearchInput__input--regex" : "",
                    error ? "SearchInput__input--error" : "",
                ].join(" ")}
                type="text"
                placeholder={placeholder}
                value={input}
                onChange={(e) => onInputChanged(e.target.value, regexEnabled)}
            />
            {allowRegex && (
                <Tooltip
                    content={`Use regular expressions to search`}
                    children={
                        <input
                            className="SearchInput__regex"
                            type="checkbox"
                            onMouseDown={(e) => e.preventDefault()}
                            checked={regexEnabled}
                            onChange={(e) => onToggleRegex(e.target.checked)}
                        />
                    }
                />
            )}
        </div>
    );
};

export default SearchInput;
