import "@assets/styles/Avatars.less";

import { CSSProperties, ReactNode } from "react";

interface Props {
    avatars: ReactNode[];
    size?: number;
}

export const AvatarStack = ({ avatars, size }: Props) => {
    return (
        <div className="AvatarStack" style={{ height: size }}>
            {avatars.map((item, i) => (
                <div className="AvatarStack__item" key={i}>
                    {item}
                </div>
            ))}
        </div>
    );
};
