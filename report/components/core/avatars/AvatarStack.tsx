import "@assets/styles/Avatars.less";

import { ReactNode } from "react";
import { TextAvatar } from "./TextAvatar";

interface Props {
    avatars: ReactNode[];
    size?: number;
    limit?: number;
}

export const AvatarStack = ({ avatars, size, limit }: Props) => {
    let left = 0;

    if (limit !== undefined) {
        left = avatars.length - limit;
        avatars = avatars.slice(0, limit);
    }

    return (
        <div className="AvatarStack" style={{ height: size }}>
            {avatars.map((item, i) => (
                <div className="AvatarStack__item" key={i}>
                    {item}
                </div>
            ))}
            {left > 0 && (
                <div className="AvatarStack__item">
                    <TextAvatar text={`... +${left}`} color="white" background="#6d7071" />
                </div>
            )}
        </div>
    );
};
