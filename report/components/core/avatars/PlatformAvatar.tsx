import { useDataProvider } from "@report/DataProvider";

import { Platforms } from "@assets/Platforms";

export const PlatformAvatar = () => {
    const dp = useDataProvider();
    const p = Platforms[dp.database.config.platform];

    return (
        <div className="Avatar">
            <div
                className="PlatformAvatar"
                style={{ backgroundColor: `hsl(${p.color[0]}, ${p.color[1]}%, ${p.color[2]}%)` }}
            >
                {p.logo}
            </div>
        </div>
    );
};
