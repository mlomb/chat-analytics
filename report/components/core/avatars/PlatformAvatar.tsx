import { PlatformsInfo } from "@pipeline/Platforms";
import { useDataProvider } from "@report/DataProvider";

import { PlatformLogos } from "@assets/PlatformLogos";

export const PlatformAvatar = () => {
    const dp = useDataProvider();
    const p = PlatformsInfo[dp.database.config.platform];

    return (
        <div className="Avatar">
            <div
                className="PlatformAvatar"
                style={{ backgroundColor: `hsl(${p.color[0]}, ${p.color[1]}%, ${p.color[2]}%)` }}
            >
                {PlatformLogos[dp.database.config.platform]}
            </div>
        </div>
    );
};
