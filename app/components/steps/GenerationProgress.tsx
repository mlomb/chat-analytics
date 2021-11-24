import { Platform } from "@pipeline/Types";
import { Platforms } from "@app/Platforms";

import Tick from "@assets/images/tick.svg";
import Spinner from "@assets/images/spinner.svg";

type Status = "pending" | "success" | "error";

interface Props {
    platform: Platform | null;
}

interface ItemInfo {
    status: Status;
    title: string;
    error?: string;
    progress?: [number, number];
}

const StatusItem = ({ info }: { info: ItemInfo }) => {
    return (
        <div className="StatusItem">
            <div className="StatusItem__icon">
                <img src={info.status === "pending" ? Spinner : Tick} />
            </div>
            {info.title}
        </div>
    );
};

const GenerationProgress = ({ platform }: Props) => (
    <div className="GenerationProgress">
        <StatusItem
            info={{
                status: "error",
                title: "Generate report",
            }}
        />
        <StatusItem
            info={{
                status: "success",
                title: "Generate report",
            }}
        />
        <StatusItem
            info={{
                status: "pending",
                title: "Generate report",
                progress: [60, 100],
            }}
        />
        <StatusItem
            info={{
                status: "pending",
                title: "Generate report",
            }}
        />
        <StatusItem
            info={{
                status: "pending",
                title: "Generate report",
            }}
        />
        <div className="GenerationProgress__shadow"></div>
    </div>
);

export default GenerationProgress;
