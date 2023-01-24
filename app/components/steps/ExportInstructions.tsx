import { PlatformInstructions } from "@app/components/PlatformInstructions";
import { Platform } from "@pipeline/Types";

import { Platforms } from "@assets/Platforms";

interface Props {
    platform?: Platform;
}

export const ExportInstructions = ({ platform }: Props) => {
    const p = platform ? Platforms[platform] : undefined;

    return (
        <div className="ExportInstructions">
            You need to export the chats you want to analyze.
            <br />
            <br />
            Follow these steps to export chats in{" "}
            <span
                style={{
                    color: `hsl(${p?.color[0]}, ${p?.color[1]}%, ${p?.color[2]}%)`,
                }}
            >
                {p?.title}
            </span>
            :
            <br />
            {PlatformInstructions[platform!]}
        </div>
    );
};
