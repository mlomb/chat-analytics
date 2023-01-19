interface Props {
    text: string;
    color: string;
    background: string;
    useInitials?: number;
}

export const TextAvatar = ({ text, color, background, useInitials }: Props) => {
    if (useInitials !== undefined) {
        const parts = text.split(" ");
        const keepParts = parts.slice(0, useInitials);

        let initials: string = "";

        for (const part of keepParts) {
            // iterate UTF-8 codepoints
            for (const symbol of part) {
                // store frist
                initials += symbol;
                break;
            }
        }

        text = initials;
    }

    return (
        <div className="Avatar">
            <div
                className="TextAvatar"
                style={{
                    color,
                    background,
                }}
            >
                {text}
            </div>
        </div>
    );
};
