import { Platforms } from "@app/Platforms";
import { Platform } from "@pipeline/Types";

interface Props {
    platform: Platform | null;
}

const ExportInstructions = ({ platform }: Props) => {
    const platformInfo = Platforms.find((p) => p.platform === platform);

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
            {platformInfo?.instructions}
        </div>
    );
};
export default ExportInstructions;
