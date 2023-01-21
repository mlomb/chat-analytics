import { Platforms } from "@app/Platforms";
import Button from "@app/components/Button";
import { Platform } from "@pipeline/Types";

interface Props {
    pickPlatform: (platform: Platform) => void;
}

const PlatformSelect = ({ pickPlatform }: Props) => (
    <div className="PlatformSelect__buttons">
        {Platforms.map((p) => (
            <Button key={p.platform} hueColor={p.color} onClick={() => pickPlatform(p.platform)}>
                {p.logo}
                {p.title}
            </Button>
        ))}
    </div>
);

export default PlatformSelect;
