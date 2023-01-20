import { useEffect, useRef } from "react";
import prettyBytes from "pretty-bytes";

import { ProgressKeys, TaskInfo } from "@pipeline/Progress";

import Tick from "@assets/images/icons/tick.svg";
import Spinner from "@assets/images/icons/spinner.svg";
import Times from "@assets/images/icons/times.svg";
import Refresh from "@assets/images/icons/refresh.svg";
import Hashtag from "@assets/images/icons/hashtag.svg";
import User from "@assets/images/icons/user.svg";
import Bubble from "@assets/images/icons/bubble.svg";
import Clock from "@assets/images/icons/clock.svg";
import Pause from "@assets/images/icons/pause.svg";

interface Props {
    active: boolean;
    tasks: TaskInfo[];
    keys: ProgressKeys;
}

const StatusItem = ({ info }: { info: TaskInfo }) => {
    const progress = info.progress;
    return (
        <div className={`StatusItem StatusItem--status-${info.status}`}>
            <div className="StatusItem__icon">
                <img
                    src={
                        info.status === "processing"
                            ? Spinner
                            : info.status === "success"
                            ? Tick
                            : info.status === "waiting"
                            ? Pause
                            : Times
                    }
                />
            </div>
            <span className="StatusItem__title">{info.title}</span>
            <span className="StatusItem__subject" title={info.subject}>
                {info.subject}
            </span>
            {progress && (
                <span className="StatusItem__progress">
                    {progress.format === "number" &&
                        `${progress.actual}${progress.total !== undefined ? `/${progress.total}` : ""}`}
                    {progress.format === "bytes" &&
                        `${prettyBytes(progress.actual)}${
                            progress.total !== undefined ? `/${prettyBytes(progress.total)}` : ""
                        }`}
                </span>
            )}
        </div>
    );
};

const ErrorBox = ({ error }: { error: string }) => {
    return (
        <>
            <div className="ErrorBox">{error}</div>
            <a href="/" className="ViewDownloadReport__restart">
                <img src={Refresh} alt="Refresh" />
                Start again
            </a>
        </>
    );
};

const Timer = (props: { active: boolean }) => {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const start = Date.now();
        const formatDiff = () => {
            const seconds = Math.floor((Date.now() - start) / 1000);
            const s = seconds % 60;
            const m = Math.floor(seconds / 60);
            return (m + "").padStart(2, "0") + ":" + (s + "").padStart(2, "0");
        };
        if (props.active) {
            const id = setInterval(() => (ref.current ? (ref.current.innerText = formatDiff()) : undefined), 1000);
            return () => {
                clearInterval(id);
                console.log("Stopped timer at", formatDiff());
            };
        }
    }, [props.active]);

    return <span ref={ref}>00:00</span>;
};

const GenerationProgress = (props: Props) => {
    const error = props.tasks[props.tasks.length - 1].error;
    return (
        <>
            <div className="GenerationProgress__stats">
                <div className="GenerationProgress__stat" title="# of channels">
                    <img src={Hashtag} />
                    {(props.keys["channels"] || 0).toLocaleString()}
                </div>
                <div className="GenerationProgress__stat" title="# of authors">
                    <img src={User} />
                    {(props.keys["authors"] || 0).toLocaleString()}
                </div>
                <div className="GenerationProgress__stat" title="# of messages">
                    <img src={Bubble} />
                    {(props.keys["messages"] || 0).toLocaleString()}
                </div>
                <div className="GenerationProgress__stat" title="time">
                    <img src={Clock} />
                    <Timer active={props.active && error === undefined} />
                </div>
            </div>
            <div className="GenerationProgress">
                {props.tasks.slice(-6).map((item, index) => (
                    <StatusItem key={index} info={item} />
                ))}
                {props.tasks.length > 6 && <div className="GenerationProgress__shadow"></div>}
            </div>
            {error && <ErrorBox error={error} />}
        </>
    );
};

export default GenerationProgress;
