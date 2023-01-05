export const TabContainer = (props: { currentValue: string; value: string; children: JSX.Element }) => (
    <div
        style={{
            display: props.currentValue === props.value ? "block" : "none",
        }}
        role="tabpanel"
    >
        {props.children}
    </div>
);

export const TabSwitch = (props: {
    currentValue: string;
    value: string;
    children: React.ReactNode;
    onChange: (value: string) => void;
}) => {
    const selected = props.currentValue === props.value;
    return (
        <a
            className={selected ? "active" : ""}
            onClick={() => props.onChange(props.value)}
            role="tab"
            aria-selected={selected}
        >
            {props.children}
        </a>
    );
};
