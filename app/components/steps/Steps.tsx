import "@assets/styles/Steps.less";

import { useEffect, useState } from "react";

import { Platform, ReportResult } from "@pipeline/Types";
import WorkerApp from "@app/WorkerApp";

import Stepper from "@app/components/Stepper";
import Button from "@app/components/Button";

import PlatformSelect from "./PlatformSelect";
import ExportInstructions from "./ExportInstructions";
import FilesSelect from "./FilesSelect";
import GenerationProgress from "./GenerationProgress";
import ViewDownloadReport from "./ViewDownloadReport";

// prettier-ignore
const StepTitles = [
    "Select chat platform",
    "Export your chats",
    "Select exported files",
    "Generate report",
    "View/Download report"
];
const StepMaxHeights = [360, 1300, 400, 300, 420];

const BackColor: [number, number, number] = [216, 10, 10];
const NextColor: [number, number, number] = [258, 90, 61];

const Steps = () => {
    const [state, setState] = useState<{
        currentStep: number;
        platform: Platform | null;
        files: File[];
        worker: Worker | null;
        result: ReportResult | null;
    }>({
        currentStep: 0,
        platform: null,
        files: [],
        worker: null,
        result: null,
    });

    useEffect(() => state.worker?.terminate(), []);

    const startGeneration = () => {
        const worker = new WorkerApp() as Worker;
        worker.onerror = (e) => {
            console.log(e);
            alert("An error ocurred creating the WebWorker.\n\n Error: " + e.message);
            worker.terminate();
        };
        worker.onmessage = (e: MessageEvent<ReportResult>) => {
            const data = e.data;
            if (data.type === "result") {
                worker.terminate();
                // give a small delay
                setTimeout(() => {
                    setState({
                        ...state,
                        currentStep: 4,
                        worker: null,
                        result: data,
                    });
                }, 1000);
            }
        };
        // <InitMessage>
        worker.postMessage({
            platform: state.platform,
            files: state.files,
        });
        setState({
            ...state,
            currentStep: 3,
            worker,
        });

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
                <GenerationProgress worker={state.worker} />
                <ViewDownloadReport result={state.result} />
            </Stepper>
        </div>
    );
};

export default Steps;
