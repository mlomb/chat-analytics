interface Props {
    text: string;
    color: string;
    background: string;
}

export const LettersAvatar = ({ text, color, background }: Props) => {
    const parts = text.split(" ");

    // only keep parts in the extremes
    const keepParts = parts.length === 1 ? [parts[0]] : [parts[0], parts[parts.length - 1]];

    let letters: string = "";

    for (const part of keepParts) {
        // iterate UTF-8 codepoints
        for (const symbol of part) {
            // store frist
            letters += symbol;
            break;
        }
    }

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
                userSelect: "none",
                fontSize: "0.85em",
                whiteSpace: "nowrap",
                color,
                background,
            }}
        >
            {letters}
        </div>
    );
};
