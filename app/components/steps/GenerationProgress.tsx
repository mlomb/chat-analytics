import prettyBytes from "pretty-bytes";

import { TaskInfo } from "@pipeline/Progress";

import Tick from "@assets/images/tick.svg";
import Spinner from "@assets/images/spinner.svg";
import Times from "@assets/images/times.svg";
import Refresh from "@assets/images/refresh.svg";

interface Props {
    tasks: TaskInfo[];
}

const StatusItem = ({ info }: { info: TaskInfo }) => {
    const progress = info.progress;
    return (
        <div className={`StatusItem StatusItem--status-${info.status}`}>
            <div className="StatusItem__icon">
                <img src={info.status === "processing" ? Spinner : info.status === "success" ? Tick : Times} />
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

const GenerationProgress = (props: Props) => {
    const error = props.tasks[props.tasks.length - 1].error;
    return (
        <>
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
