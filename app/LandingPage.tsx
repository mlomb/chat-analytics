import { useState } from "react";

import Stepper from "@app/components/Stepper";

import Lock from "@assets/lock.svg";
import GitHub from "@assets/github.svg";
import Waves from "@assets/waves.svg";

const StepTitles = ["Select chat platform", "Select export files", "Generate report", "View/Download report"];

const LandingPage = () => {
    const [step, setStep] = useState(0);

    return (
        <>
            <div className={"container" + (step > 0 ? " container--hidden" : "")}>
                <div className="land">
                    <div className="land__title">Generate in-depth chat analysis reports</div>
                    <div className="land__desc">
                        <div className="sameline">
                            Everything is done in your browser.
                            <img src={Lock} alt="Lock" />
                            No data leaves.
                        </div>
                        <br />
                        Free and <span>open source</span>.
                    </div>
                    <div className="land__buttons">
                        <div className="button cta-button" onClick={() => setStep(1)}>
                            Generate a report
                        </div>
                        <a className="button github-button" href="https://github.com">
                            <img src={GitHub} alt="GitHub" />
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
            <div className={"container" + (step === 0 ? " container--hidden" : "")}>
                <div className="steps">
                    <Stepper step={step} stepTitles={StepTitles}>
                        <div onClick={() => setStep((step + 1) % 5)}>A</div>
                        <div onClick={() => setStep((step + 1) % 5)}>B</div>
                        <div onClick={() => setStep((step + 1) % 5)}>C</div>
                        <div onClick={() => setStep((step + 1) % 5)}>D</div>
                    </Stepper>
                </div>
            </div>
            <img className="waves" src={Waves} alt="" />
        </>
    );
};

export default LandingPage;
