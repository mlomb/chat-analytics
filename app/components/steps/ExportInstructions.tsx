import { PlatformInstructions } from "@app/components/PlatformInstructions";
import { Platform } from "@pipeline/Types";

import { Platforms } from "@assets/Platforms";

interface Props {
    platform?: Platform;
}

export const ExportInstructions = ({ platform }: Props) => {
    const info = platform ? Platforms[platform] : undefined;

    return (
        <div className="ExportInstructions">
            You need to export the chats you want to analyze.
            <br />
            <br />
            Follow these steps to export chats in{" "}
            <span
                style={{
                    color: `hsl(${info?.color[0]}, ${info?.color[1]}%, ${info?.color[2]}%)`,
                }}
            >
                {info?.title}
            </span>
            :
            <br />
            {PlatformInstructions[platform!]}
        </div>
    );
};
