import "@assets/styles/Steps.less";

import { useEffect, useState } from "react";

import { Platform, StepInfo } from "@pipeline/Types";
import WorkerApp from "@app/WorkerApp";

import Stepper from "@app/components/Stepper";
import Button from "@app/components/Button";

import PlatformSelect from "./PlatformSelect";
import ExportInstructions from "./ExportInstructions";
import FilesSelect from "./FilesSelect";
import GenerationProgress from "./GenerationProgress";

// prettier-ignore
const StepTitles = [
    "Select chat platform",
    "Export your chats",
    "Select exported files",
    "Generate report",
    "View/Download report"
];

const BackColor: [number, number, number] = [216, 10, 10];
const NextColor: [number, number, number] = [258, 90, 61];

const Steps = () => {
    const [state, setState] = useState<{
        currentStep: number;
        platform: Platform | null;
        files: File[];
        worker: Worker | null;
    }>({
        currentStep: 0,
        platform: null,
        files: [],
        worker: null,
    });

    useEffect(() => state.worker?.terminate(), []);

    const startGeneration = () => {
        const worker = new WorkerApp() as Worker;
        worker.onerror = (e) => {
            console.log(e);
            alert("An error ocurred inside the WebWorker, please raise an issue on GitHub.\n\n Error: " + e.message);
            worker.terminate();
            // TODO: ui feedback
        };
        worker.onmessage = (e: MessageEvent<StepInfo>) => {
            // TODO: check for completion
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
    };

    return (
        <div className="Steps">
            <Stepper step={state.currentStep} stepTitles={StepTitles}>
                <PlatformSelect pickPlatform={(p) => setState({ ...state, currentStep: 1, platform: p })} />
                <div>
                    <ExportInstructions platform={state.platform} />
                    <div className="Steps__nav">
                        <Button
                            color={BackColor}
                            onClick={() => setState({ ...state, currentStep: 0, platform: null })}
                        >
                            Back
                        </Button>
                        <Button color={NextColor} onClick={() => setState({ ...state, currentStep: 2 })}>
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
                        <Button color={BackColor} onClick={() => setState({ ...state, currentStep: 1, files: [] })}>
                            Back
                        </Button>
                        <Button color={NextColor} disabled={state.files.length === 0} onClick={startGeneration}>
                            Generate report!
                        </Button>
                    </div>
                </div>
                <div>
                    <GenerationProgress worker={state.worker} />
                </div>
                <div>Done step</div>
            </Stepper>
        </div>
    );
};

export default Steps;
