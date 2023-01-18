import "@assets/styles/Avatars.less";

import { TextAvatar } from "@report/components/core/avatars/TextAvatar";
import { ReactNode } from "react";

interface Props {
    avatars: ReactNode[];
    limit?: number;
}

export const AvatarStack = ({ avatars, limit }: Props) => {
    let left = 0;

    if (limit !== undefined) {
        left = avatars.length - limit;
        avatars = avatars.slice(0, limit);
    }

    return (
        <div className="AvatarStack">
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
