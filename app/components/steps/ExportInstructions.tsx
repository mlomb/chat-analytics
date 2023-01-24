import { PlatformInstructions } from "@app/components/PlatformInstructions";
import { Platform } from "@pipeline/Types";

import { Platforms } from "@assets/Platforms";

interface Props {
    platform: Platform | null;
}

const ExportInstructions = ({ platform }: Props) => {
    const platformInfo = platform ? Platforms[platform] : undefined;
    const instructions = platform ? PlatformInstructions[platform] : undefined;

    return (
        <div className="ExportInstructions">
            You need to export the chats you want to analyze.
            <br />
            <br />
            Follow these steps to export chats in{" "}
            <span
                style={{
                    color: `hsl(${platformInfo?.color[0]}, ${platformInfo?.color[1]}%, ${platformInfo?.color[2]}%)`,
                }}
            >
                {platformInfo?.title}
            </span>
            :
            <br />
            {instructions}
        </div>
    );
};
export default ExportInstructions;
