import { useState, useEffect } from "react";

import { StepInfo } from "@pipeline/Types";

import Tick from "@assets/images/tick.svg";
import Spinner from "@assets/images/spinner.svg";

type Status = "pending" | "success" | "error";

interface Props {
    worker: Worker | null;
}

interface ItemInfo {
    status: Status;
    title: string;
    progress?: [number, number];
    error?: string;
}

const StatusItem = ({ info }: { info: ItemInfo }) => {
    return (
        <div className={`StatusItem StatusItem--status-${info.status}`}>
            <div className="StatusItem__icon">
                <img src={info.status === "pending" ? Spinner : Tick} />
            </div>
            {info.title}
            {info.progress && (
                <div className="StatusItem__progress">
                    {info.progress[0]} / {info.progress[1]}
                </div>
            )}
        </div>
    );
};

const GenerationProgress = ({ worker }: Props) => {
    const [items, setItems] = useState<ItemInfo[]>([
        {
            status: "success",
            title: "Start WebWorker",
        },
    ]);

    useEffect(() => {
        if (worker === null) return;

        const oldonmessage = worker.onmessage?.bind(worker);
        worker.onmessage = (e: MessageEvent<StepInfo>) => {
            if (oldonmessage) oldonmessage(e);

            const data = e.data;
            if (!["new", "progress", "done"].includes(data.type)) return;

            setItems((prevState: ItemInfo[]) => {
                const newItems = [...prevState];
                if (data.type === "new") {
                    newItems.push({
                        status: "pending",
                        title: data.title,
                        progress: data.total != undefined ? [0, data.total] : undefined,
                    });
                } else if (data.type === "progress") {
                    const last = prevState[prevState.length - 1];
                    newItems.splice(-1);
                    newItems.push({
                        ...last,
                        progress: [data.progress, last.progress![1]],
                    });
                } else if (data.type === "done") {
                    const last = prevState[prevState.length - 1];
                    newItems.splice(-1);
                    newItems.push({
                        ...last,
                        status: "success",
                    });
                }
                return newItems;
            });
        };
    }, [worker]);

    return (
        <div className="GenerationProgress">
            {items.slice(-6).map((item, index) => (
                <StatusItem key={index} info={item} />
            ))}
            {items.length > 6 && <div className="GenerationProgress__shadow"></div>}
        </div>
    );
};

export default GenerationProgress;
