import { Button } from "@app/components/Button";
import { Platform } from "@pipeline/Types";

import { Platforms } from "@assets/Platforms";

interface Props {
    pickPlatform: (platform: Platform) => void;
}

export const PlatformSelection = ({ pickPlatform }: Props) => (
    <div className="PlatformSelect__buttons">
        {Object.entries(Platforms).map(([key, p]) => (
            <Button key={key} hueColor={p.color} onClick={() => pickPlatform(key as Platform)}>
                {p.logo}
                {p.title}
            </Button>
        ))}
    </div>
);
