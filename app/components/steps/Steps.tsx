import "@assets/styles/Steps.less";

import { useState } from "react";

import { Platform } from "@pipeline/Types";
import Stepper from "@app/components/Stepper";
import Button from "@app/components/Button";

import PlatformSelect from "./PlatformSelect";
import ExportChats from "./ExportChats";
import FilesSelect from "./FilesSelect";

// prettier-ignore
const StepTitles = [
    "Select chat platform",
    "Export your chats",
    "Select exported files",
    "Generate report",
    "View/Download report"
];

const StepNavButtons = (props: {
    onBack: () => void;
    onNext: () => void;
    nextDisabled?: boolean;
    nextText: string;
}) => {
    return (
        <div className="Steps__nav">
            <Button color={[216, 10, 10]} onClick={props.onBack}>
                Back
            </Button>
            <Button color={[258, 90, 61]} onClick={props.onNext} disabled={props.nextDisabled}>
                {props.nextText}
            </Button>
        </div>
    );
};

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
                    <ExportChats platform={state.platform} />
                    <StepNavButtons
                        onBack={() => setState({ ...state, currentStep: 0, platform: null })}
                        onNext={() => setState({ ...state, currentStep: 2 })}
                        nextText="Continue"
                    />
                </div>
                <div>
                    <FilesSelect
                        platform={state.platform}
                        files={state.files}
                        onFilesUpdate={(files) => setState({ ...state, files })}
                    />
                    <StepNavButtons
                        onBack={() => setState({ ...state, currentStep: 1, files: [] })}
                        onNext={() => setState({ ...state, currentStep: 3 })}
                        nextText="Generate report!"
                        nextDisabled={state.files.length === 0}
                    />
                </div>
                <div>C</div>
                <div>D</div>
            </Stepper>
        </div>
    );
};

export default Steps;
