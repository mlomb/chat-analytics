import prettyBytes from "pretty-bytes";
import { useLayoutEffect, useRef } from "react";

import { RestartLink } from "@app/components/RestartLink";
import { ProgressStats, ProgressTask } from "@pipeline/Progress";

import Bubble from "@assets/images/icons/bubble.svg";
import Clock from "@assets/images/icons/clock.svg";
import Files from "@assets/images/icons/files.svg";
import Hashtag from "@assets/images/icons/hashtag.svg";
import Pause from "@assets/images/icons/pause.svg";
import Spinner from "@assets/images/icons/spinner.svg";
import Tick from "@assets/images/icons/tick.svg";
import Times from "@assets/images/icons/times.svg";
import User from "@assets/images/icons/user.svg";

const prettyBytesAligned = (n: number) => prettyBytes(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Props {
    /** Whether the generation is currently running (still processing) */
    working: boolean;

    tasks: ProgressTask[];
    stats: ProgressStats;
}

const TaskProgress = ({
    actual,
    total,
    format,
}: {
    actual: number;
    total?: number;
    format: (value: number) => string;
}) => (
    <span className="TaskItem__progress">
        {format(actual)}
        {total !== undefined && actual < total ? "/" + format(total) : ""}
    </span>
);

const TaskItem = ({ task: { title, subject, status, progress } }: { task: ProgressTask }) => (
    <div className={`TaskItem TaskItem--status-${status}`}>
        <div className="TaskItem__icon">
            <img
                src={
                    status === "processing"
                        ? Spinner
                        : status === "success"
                        ? Tick
                        : status === "waiting"
                        ? Pause
                        : Times
                }
            />
        </div>
        <span className="TaskItem__title">{title}</span>
        <span className="TaskItem__subject" title={subject}>
            {subject}
        </span>
        {progress &&
            (progress.format === "number" ? (
                <TaskProgress {...progress} format={(value) => value.toLocaleString()} />
            ) : (
                <TaskProgress {...progress} format={prettyBytesAligned} />
            ))}
    </div>
);

const Timer = ({ ticking }: { ticking: boolean }) => {
    const ref = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
        const start = Date.now();

        // no need to use a library for this...
        const formatDiff = () => {
            const seconds = Math.floor((Date.now() - start) / 1000);
            const s = seconds % 60;
            const m = Math.floor(seconds / 60);
            return (m + "").padStart(2, "0") + ":" + (s + "").padStart(2, "0");
        };

        if (ticking) {
            const updateText = () => (ref.current ? (ref.current.innerText = formatDiff()) : undefined);
            const id = setInterval(updateText, 1000);
            return () => clearInterval(id);
        }
    }, [ticking]);

    return <span ref={ref}>00:00</span>;
};

const ErrorBox = ({ error }: { error: string }) => (
    <>
        <div className="ErrorBox">{error}</div>
        <RestartLink text="Start again" />
    </>
);

export const GenerationProgress = (props: Props) => {
    const error = props.tasks[props.tasks.length - 1].error;
    const stat = (name: string) => (props.stats[name] || 0).toLocaleString();
    return (
        <>
            <div className="GenerationProgress__stats">
                <div className="GenerationProgress__stat" title="# of channels">
                    <img src={Hashtag} />
                    {stat("channels")}
                </div>
                <div className="GenerationProgress__stat" title="# of authors">
                    <img src={User} />
                    {stat("authors")}
                </div>
                <div className="GenerationProgress__stat" title="# of messages">
                    <img src={Bubble} />
                    {stat("messages")}
                </div>
                <div className="GenerationProgress__stat" title="# of input files processed">
                    <img src={Files} />
                    {stat("processed_files")}/{stat("total_files")}
                </div>
                <div className="GenerationProgress__stat" title="time elapsed">
                    <img src={Clock} />
                    <Timer ticking={props.working && error === undefined} />
                </div>
            </div>
            <div className="GenerationProgress">
                {props.tasks.slice(-6).map((item, index) => (
                    <TaskItem key={index} task={item} />
                ))}
                {props.tasks.length > 6 && <div className="GenerationProgress__shadow"></div>}
            </div>
            {error && <ErrorBox error={error} />}
        </>
    );
};
