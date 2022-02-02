import "@assets/styles/Landing.less";

import { Platforms } from "@app/Platforms";

import Button from "@app/components/Button";

import Lock from "@assets/images/icons/lock.svg";
import GitHub from "@assets/images/logos/github.svg";

interface Props {
    onStart: () => void;
}

const Landing = ({ onStart }: Props) => {
    return (
        <div className="Landing">
            <div className="Landing__title">Generate in-depth chat analysis reports</div>
            <div className="Landing__desc">
                <div className="Landing__sameline">
                    <span className="Landing__browser">Everything is processed in your browser.</span>
                    <span className="Landing__secure">
                        <img src={Lock} alt="Lock" />
                        No data leaves your device.
                    </span>
                </div>
                <br />
                Free and <span>open source</span>.
                <br />
                <br />
                <div className="Landing__platforms-line">
                    <span>Supports</span>
                    {Platforms.map((p) => (
                        <div
                            className="Landing__platform"
                            key={p.platform}
                            style={{
                                backgroundColor: `hsl(${p.color[0]}, ${p.color[1]}%, ${p.color[2]}%)`,
                            }}
                        >
                            {p.logo}
                        </div>
                    ))}
                </div>
            </div>
            <div className="Landing__buttons">
                <Button hueColor={[258, 90, 61]} className="Landing__cta" onClick={onStart}>
                    Generate a report
                </Button>
                <Button hueColor={[244, 90, 61]} href="/demo" target="_blank">
                    View Demo
                </Button>
                <Button hueColor={[207, 23, 8]} href="https://github.com/mlomb/chat-analytics" target="_blank">
                    <img src={GitHub} alt="" />
                    GitHub
                </Button>
            </div>
        </div>
    );
};

export default Landing;
