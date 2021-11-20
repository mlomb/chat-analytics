import "@assets/styles/Steps.less";

import { useState } from "react";

import { Platform } from "@pipeline/Types";
import Stepper from "@app/components/Stepper";

import PlatformSelect from "./PlatformSelect";

// prettier-ignore
const StepTitles = [
    "Select chat platform",
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
                <div>B</div>
                <div>C</div>
                <div>D</div>
            </Stepper>
        </div>
    );
};

export default Steps;
