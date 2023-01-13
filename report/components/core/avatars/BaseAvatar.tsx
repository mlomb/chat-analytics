import "@assets/styles/Avatars.less";

import { ReactNode } from "react";

export interface AvatarProps {
    index: number;
}

interface BaseAvatarProps {
    children: ReactNode;
}

export const BaseAvatar = ({ children }: BaseAvatarProps) => <div className="Avatar">{children}</div>;
