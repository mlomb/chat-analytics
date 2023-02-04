import { Button } from "@app/components/Button";
import { Platform, PlatformsInfo } from "@pipeline/Platforms";

import { PlatformLogos } from "@assets/PlatformLogos";

interface Props {
    pickPlatform: (platform: Platform) => void;
}

export const PlatformSelection = ({ pickPlatform }: Props) => (
    <div className="PlatformSelect__buttons">
        {Object.entries(PlatformsInfo).map(([key, p]) => (
            <Button key={key} hueColor={p.color} onClick={() => pickPlatform(key as Platform)}>
                {PlatformLogos[key as Platform]}
                {p.name}
            </Button>
        ))}
    </div>
);
