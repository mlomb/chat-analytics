import "@assets/styles/Steps.less";
import Stepper from "@app/components/Stepper";
import { useState } from "react";

import PlatformSelect from "./PlatformSelect";

const StepTitles = ["Select chat platform", "Select export files", "Generate report", "View/Download report"];

const Steps = () => {
    const [step, setStep] = useState(0);

    return (
        <div className="Steps">
            <Stepper step={step} stepTitles={StepTitles}>
                <PlatformSelect pickPlatform={() => {}} />
                <div>B</div>
                <div>C</div>
                <div>D</div>
            </Stepper>
        </div>
    );
};

export default Steps;
