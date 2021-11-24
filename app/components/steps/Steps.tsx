import "@assets/styles/Steps.less";

import { useState } from "react";

import { Platform } from "@pipeline/Types";
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
    }>({
        currentStep: 0,
        platform: null,
        files: [],
    });

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
                        <Button
                            color={NextColor}
                            disabled={state.files.length === 0}
                            onClick={() => setState({ ...state, currentStep: 3 })}
                        >
                            Generate report!
                        </Button>
                    </div>
                </div>
                <GenerationProgress platform={state.platform} />
                <div>D</div>
            </Stepper>
        </div>
    );
};

export default Steps;
