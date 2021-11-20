import { useState } from "react";
import { css } from "@emotion/react";

import { Platform } from "@pipeline/Types";

import Stepper from "@app/components/Stepper";
import Button from "@app/components/Button";

import Lock from "@assets/images/lock.svg";
import Waves from "@assets/images/waves.svg";
import GitHub from "@assets/images/logos/github.svg";
import Discord from "@assets/images/logos/discord.svg";
import Telegram from "@assets/images/logos/telegram.svg";
import WhatsApp from "@assets/images/logos/whatsapp.svg";

const StepTitles = ["Select chat platform", "Select export files", "Generate report", "View/Download report"];

const LandingPage = () => {
    const [step, setStep] = useState(0);
    const [platform, setPlatform] = useState<Platform | null>(null);

    const selectPlatform = (platform: Platform) => {};

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
                        <Button
                            color={[258, 90, 61]}
                            onClick={() => setStep(1)}
                            cssStack={css`
                                margin-right: 25px;
                                box-shadow: 0 14px 30px 0 rgb(118 64 245 / 20%);

                                &:hover {
                                    box-shadow: 0 20px 35px 0 rgb(118 64 245 / 20%);
                                    transform: scale(1.05);
                                }
                            `}
                        >
                            Generate a report
                        </Button>
                        <Button color={[207, 23, 8]} href="https://github.com">
                            <img src={GitHub} alt="GitHub" />
                            GitHub
                        </Button>
                    </div>
                </div>
            </div>
            <div className={"container" + (step === 0 ? " container--hidden" : "")}>
                <div className="steps">
                    <Stepper step={step} stepTitles={StepTitles}>
                        <div
                            onClick={() => setStep((step + 1) % 5)}
                            css={css`
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                grid-gap: 10px;
                            `}
                        >
                            <Button color={[235, 86, 65]}>
                                <img src={Discord} alt="Discord" />
                                Discord
                            </Button>
                            <Button color={[200, 100, 40]}>
                                <img src={Telegram} alt="Telegram" />
                                Telegram
                            </Button>
                            <Button color={[142, 70, 49]}>
                                <img src={WhatsApp} alt="WhatsApp" />
                                WhatsApp
                            </Button>
                        </div>
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
