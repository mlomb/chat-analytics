import "@assets/styles/Steps.less";

import { useState } from "react";

import { Platform } from "@pipeline/Types";
import { ProgressKeys, ProgressMessage, TaskInfo } from "@pipeline/Progress";
import WorkerApp, { InitMessage, ResultMessage } from "@app/WorkerApp";

import Stepper from "@app/components/Stepper";
import Button from "@app/components/Button";

import PlatformSelect from "./steps/PlatformSelect";
import ExportInstructions from "./steps/ExportInstructions";
import FilesSelect from "./steps/FilesSelect";
import GenerationProgress from "./steps/GenerationProgress";
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
        const worker = new WorkerApp() as Worker;
        worker.onerror = (e) => {
            console.log(e);
            worker.terminate();
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
                    setState((state) => ({
                        ...state,
                        currentStep: 4,
                        worker: null,
                        result: data,
                    }));
                }, 1000);
            }
        };
        // <InitMessage>
        const init: InitMessage = {
            files: state.files,
            config: {
                platform: state.platform as Platform,
            },
        };
        worker.postMessage(init);
        setState((state) => ({
            ...state,
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

    return (
        <div className="Steps">
            <Stepper step={state.currentStep} stepTitles={StepTitles} stepMaxHeights={StepMaxHeights}>
                <PlatformSelect pickPlatform={(p) => setState({ ...state, currentStep: 1, platform: p })} />
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
