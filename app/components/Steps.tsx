import { useState } from "react";

import { InitMessage, ProgressMessage, ResultMessage } from "@app/WorkerApp";
import { Button } from "@app/components/Button";
import { Stepper } from "@app/components/Stepper";
import { Platform, PlatformsInfo } from "@pipeline/Platforms";
import { ProgressStats, ProgressTask } from "@pipeline/Progress";

import { numberCategory, plausible, sizeCategory, timeCategory } from "@assets/Plausible";
import "@assets/styles/Steps.less";

import { ExportInstructions } from "./steps/ExportInstructions";
import { FilesSelection } from "./steps/FilesSelection";
import { GenerationProgress } from "./steps/GenerationProgress";
import { PlatformSelection } from "./steps/PlatformSelection";
import { ViewDownloadReport } from "./steps/ViewDownloadReport";

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

// we hardcode this task first since the worker doesn't emit it
const StartWorkerTask: ProgressTask = {
    status: "success",
    title: "Start WebWorker",
};

// This component is a bit messy since it has all the logic to talk with the Worker
// It's not that bad
export const Steps = () => {
    const [state, setState] = useState<{
        currentStep: number;
        platform: Platform | undefined;
        files: File[];
        worker: Worker | null;
        progressTasks: ProgressTask[];
        progressStats: ProgressStats;
        result: ResultMessage | null;
    }>({
        currentStep: 0,
        platform: undefined,
        files: [],
        worker: null,
        result: null,
        progressTasks: [StartWorkerTask],
        progressStats: {},
    });

    const startGeneration = () => {
        plausible("Start generation", {
            platform: state.platform as Platform,
            files: numberCategory(state.files.length),
            size: sizeCategory(state.files.reduce((acc, file) => acc + file.size, 0)),
        });
        const startTime = performance.now();
        // @ts-ignore
        const worker = new Worker(new URL("@app/WorkerApp.ts", import.meta.url));
        worker.onerror = (e) => {
            console.log(e);
            worker.terminate();
            setState((prevState) => {
                const tasks = prevState.progressTasks;
                const last = tasks[tasks.length - 1];
                last.status = "error";
                last.error = e.message;
                return {
                    ...prevState,
                    progressTasks: tasks,
                };
            });
            if (env.isDev) throw e;
        };
        worker.onmessage = (e: MessageEvent<ProgressMessage | ResultMessage>) => {
            const data = e.data;
            const endTime = performance.now();
            let terminate = false;

            if (data.type === "progress") {
                if (data.tasks.some((task) => task.status === "error")) {
                    plausible("Generation errored", {
                        platform: state.platform as Platform,
                        files: numberCategory(state.files.length),
                        time: timeCategory((endTime - startTime) / 1000),
                    });

                    terminate = true;
                }

                setState((state) => ({
                    ...state,
                    progressTasks: [StartWorkerTask, ...data.tasks],
                    progressStats: data.stats,
                }));
            } else if (data.type === "result") {
                plausible("Finish generation", {
                    platform: state.platform as Platform,
                    outputSize: sizeCategory(data.html.length),
                    messages: numberCategory(data.counts.messages),
                    authors: numberCategory(data.counts.authors),
                    channels: numberCategory(data.counts.channels),
                    guilds: numberCategory(data.counts.guilds),
                    time: timeCategory((endTime - startTime) / 1000),
                });

                // give a small delay
                setTimeout(() => {
                    setState((prevState) => ({
                        ...prevState,
                        currentStep: 4,
                        worker: null,
                        result: data,
                    }));
                }, 1000);

                // terminate worker since we don't need it anymore
                terminate = true;
            }

            if (terminate && env.isProd) {
                worker.terminate();
            }
        };

        // send message to start generation
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

        // show usaved progress alert before leaving
        if (env.isProd) {
            window.addEventListener("beforeunload", (event) => {
                // this message is never shown really.
                event.returnValue = `Are you sure you want to leave?`;
            });
        }
    };

    const pickPlatform = (platform: Platform) => {
        plausible("Pick platform", { platform });
        setState({ ...state, currentStep: 1, platform });
    };

    const info = state.platform ? PlatformsInfo[state.platform] : undefined;

    return (
        <div className="Steps">
            <Stepper step={state.currentStep} stepTitles={StepTitles} stepMaxHeights={StepMaxHeights}>
                <PlatformSelection pickPlatform={pickPlatform} />
                <div>
                    <ExportInstructions platform={state.platform} />
                    <div className="Steps__nav">
                        <Button hueColor={BackColor} onClick={() => setState({ ...state, currentStep: 0 })}>
                            Back
                        </Button>
                        <Button hueColor={NextColor} onClick={() => setState({ ...state, currentStep: 2 })}>
                            Continue
                        </Button>
                    </div>
                </div>
                <div>
                    <FilesSelection
                        defaultFilename={info?.defaultFilename}
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
                <GenerationProgress
                    working={state.worker !== null}
                    tasks={state.progressTasks}
                    stats={state.progressStats}
                />
                <ViewDownloadReport result={state.result} />
            </Stepper>
        </div>
    );
};
