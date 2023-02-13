import { PlatformsInfo } from "@pipeline/Platforms";
import { getDatabase } from "@report/WorkerWrapper";

import { PlatformLogos } from "@assets/PlatformLogos";

export const PlatformAvatar = () => {
    const db = getDatabase();
    const p = PlatformsInfo[db.config.platform];

    return (
        <div className="Avatar">
            <div
                className="PlatformAvatar"
                style={{ backgroundColor: `hsl(${p.color[0]}, ${p.color[1]}%, ${p.color[2]}%)` }}
            >
                {PlatformLogos[db.config.platform]}
            </div>
        </div>
    );
};
