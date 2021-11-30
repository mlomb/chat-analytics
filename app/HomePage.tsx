import "@assets/styles/HomePage.less";
import { useState } from "react";

import Landing from "@app/components/Landing";
import Steps from "@app/components/steps/Steps";

import Logo from "@assets/images/logo.svg";

const HomePage = () => {
    const [showLanding, setShowLanding] = useState(true);

    return (
        <div className="HomePage">
            <a href="/" className="HomePage__logo">
                <img src={Logo} alt="chatstbdtbd.app logo" />
            </a>
            <div style={{ display: showLanding ? "" : "none" }}>
                <Landing onStart={() => setShowLanding(false)} />
            </div>
            <div style={{ display: !showLanding ? "" : "none" }}>
                <Steps />
            </div>
        </div>
    );
};

export default HomePage;
