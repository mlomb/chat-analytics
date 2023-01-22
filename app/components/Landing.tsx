import { Platforms } from "@app/Platforms";
import Button from "@app/components/Button";

import Lock from "@assets/images/icons/lock.svg";
import GitHub from "@assets/images/logos/github.svg";
import "@assets/styles/Landing.less";

interface Props {
    onStart: () => void;
}

const Landing = ({ onStart }: Props) => {
    return (
        <div className="Landing">
            <h1 className="Landing__title">Generate insightful chat analysis reports</h1>
            <div className="Landing__desc">
                <div className="Landing__sameline">
                    <p className="Landing__browser">Everything is processed in your browser.</p>
                    <span className="Landing__secure">
                        <img src={Lock} alt="Lock" />
                        <p>No data leaves your device.</p>
                    </span>
                </div>
                <br />
                <p>Free and open source.</p>
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
