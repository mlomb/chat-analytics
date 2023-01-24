import Button from "@app/components/Button";
import { Platform } from "@pipeline/Types";

import { Platforms } from "@assets/Platforms";

interface Props {
    pickPlatform: (platform: Platform) => void;
}

const PlatformSelect = ({ pickPlatform }: Props) => (
    <div className="PlatformSelect__buttons">
        {Object.entries(Platforms).map(([key, p]) => (
            <Button key={key} hueColor={p.color} onClick={() => pickPlatform(p.platform)}>
                {p.logo}
                {p.title}
            </Button>
        ))}
    </div>
);

export default PlatformSelect;
