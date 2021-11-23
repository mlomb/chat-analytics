import "@assets/styles/Steps.less";

import { useState } from "react";

import { Platform } from "@pipeline/Types";
import Stepper from "@app/components/Stepper";

import PlatformSelect from "./PlatformSelect";
import ExportChats from "./ExportChats";
import FilesSelect from "./FilesSelect";

// prettier-ignore
const StepTitles = [
    "Select chat platform",
    "Export your chats",
    "Select export files",
    "Generate report",
    "View/Download report"
];

const Steps = () => {
    const [state, setState] = useState<{
        currentStep: number;
        platform: Platform | null;
    }>({
        currentStep: 0,
        platform: null,
    });

    return (
        <div className="Steps">
            <Stepper step={state.currentStep} stepTitles={StepTitles}>
                <PlatformSelect pickPlatform={(p) => setState({ currentStep: 1, platform: p })} />
                <ExportChats
                    platform={state.platform}
                    onBack={() => setState({ currentStep: 0, platform: null })}
                    onNext={() => setState({ ...state, currentStep: 2 })}
                />
                <FilesSelect platform={state.platform} />
                <div>C</div>
                <div>D</div>
            </Stepper>
        </div>
    );
};

export default Steps;
