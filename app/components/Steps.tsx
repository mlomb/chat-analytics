import { useState } from "react";

import { InitMessage, ResultMessage } from "@app/WorkerApp";
import Button from "@app/components/Button";
import Stepper from "@app/components/Stepper";
import { ProgressKeys, ProgressMessage, TaskInfo } from "@pipeline/Progress";
import { Platform } from "@pipeline/Types";

import { numberCategory, plausible, sizeCategory, timeCategory } from "@assets/Plausible";
import "@assets/styles/Steps.less";

import ExportInstructions from "./steps/ExportInstructions";
import FilesSelect from "./steps/FilesSelect";
import GenerationProgress from "./steps/GenerationProgress";
import PlatformSelect from "./steps/PlatformSelect";
import ViewDownloadReport from "./steps/ViewDownloadReport";

// prettier-ignore
const StepTitles = [
    "Select chat platform",
    "Export your chats",
    "Select exported files",
    "Generate report",
    "View/Download report"
];
const StepMaxHeights = [360, 1300, 400, 420, 420];

const BackColor: [number, number, number] = [216, 10, 10];
const NextColor: [number, number, number] = [258, 90, 61];

const Steps = () => {
    const [state, setState] = useState<{
        currentStep: number;
        platform: Platform | null;
        files: File[];
        worker: Worker | null;
        result: ResultMessage | null;
        tasks: TaskInfo[];
        progressKeys: ProgressKeys;
    }>({
        currentStep: 0,
        platform: null,
        files: [],
        worker: null,
        result: null,
        tasks: [
            {
                status: "processing",
                title: "Start WebWorker",
            },
        ],
        progressKeys: {},
    });

    const startGeneration = () => {
        plausible("Start generation", {
            platform: state.platform as Platform,
            files: state.files.length + "",
            size: sizeCategory(state.files.reduce((acc, file) => acc + file.size, 0)),
        });
        const startTime = performance.now();
        // @ts-ignore
        const worker = new Worker(new URL("@app/WorkerApp.ts", import.meta.url));
        worker.onerror = (e) => {
            console.log(e);
            worker.terminate();
            setState((prevState) => {
                const tasks = prevState.tasks;
                const last = tasks[tasks.length - 1];
                last.status = "error";
                last.error = e.message;
                return {
                    ...prevState,
                    tasks,
                };
            });
            if (env.isDev) throw e;
        };
        worker.onmessage = (e: MessageEvent<ProgressMessage | ResultMessage>) => {
            const data = e.data;
            if (data.type === "progress") {
                setState((state) => ({
                    ...state,
                    tasks: [
                        {
                            status: "success",
                            title: "Start WebWorker",
                        },
                        ...data.tasks,
                    ],
                    progressKeys: data.keys,
                }));
            } else if (data.type === "result") {
                if (env.isProd) {
                    // terminate worker since we don't need it anymore
                    worker.terminate();
                }
                // give a small delay
                setTimeout(() => {
                    setState((prevState) => ({
                        ...prevState,
                        currentStep: 4,
                        worker: null,
                        result: data,
                    }));
                }, 1000);

                const endTime = performance.now();
                plausible("Finish generation", {
                    platform: state.platform as Platform,
                    outputSize: sizeCategory(data.html.length),
                    channels: numberCategory(data.counts.channels),
                    authors: numberCategory(data.counts.authors),
                    messages: numberCategory(data.counts.messages),
                    time: timeCategory((endTime - startTime) / 1000),
                });
            }
        };
        // <InitMessage>
        const init: InitMessage = {
            files: state.files,
            config: {
                platform: state.platform as Platform,
            },
            origin: window.location.origin,
        };
        worker.postMessage(init);
        setState((prevState) => ({
            ...prevState,
            currentStep: 3,
            worker,
        }));

        // show usaved progress before leaving
        if (env.isProd) {
            window.addEventListener("beforeunload", (event) => {
                // This message is never shown really.
                event.returnValue = `Are you sure you want to leave?`;
            });
        }
    };

    const pickPlatform = (platform: Platform) => {
        plausible("Pick platform", { platform });
        setState({ ...state, currentStep: 1, platform });
    };

    return (
        <div className="Steps">
            <Stepper step={state.currentStep} stepTitles={StepTitles} stepMaxHeights={StepMaxHeights}>
                <PlatformSelect pickPlatform={pickPlatform} />
                <div>
                    <ExportInstructions platform={state.platform} />
                    <div className="Steps__nav">
                        <Button
                            hueColor={BackColor}
                            onClick={() => setState({ ...state, currentStep: 0 /*, platform: null*/ })}
                        >
                            Back
                        </Button>
                        <Button hueColor={NextColor} onClick={() => setState({ ...state, currentStep: 2 })}>
                            Continue
                        </Button>
                    </div>
                </div>
                <div>
                    <FilesSelect
                        platform={state.platform}
                        files={state.files}
                        onFilesUpdate={(files) => setState({ ...state, files })}
                    />
                    <div className="Steps__nav">
                        <Button hueColor={BackColor} onClick={() => setState({ ...state, currentStep: 1, files: [] })}>
                            Back
                        </Button>
                        <Button hueColor={NextColor} disabled={state.files.length === 0} onClick={startGeneration}>
                            Generate report!
                        </Button>
                    </div>
                </div>
                <GenerationProgress tasks={state.tasks} keys={state.progressKeys} active={state.worker !== null} />
                <ViewDownloadReport result={state.result} />
            </Stepper>
        </div>
    );
};

export default Steps;
