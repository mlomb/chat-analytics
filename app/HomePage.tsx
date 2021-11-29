import "@assets/styles/HomePage.less";
import { useState } from "react";

import Landing from "@app/components/Landing";
import Steps from "@app/components/steps/Steps";

import Waves from "@assets/images/waves.svg";
import Logo from "@assets/images/logo.svg";

const HomePage = () => {
    const [showLanding, setShowLanding] = useState(true);

    return (
        <>
            <div className="Container">
                <img className="Container__logo" src={Logo} alt="chatstbdtbd.app logo" />
                <Steps />
            </div>
        </>
    );
};

export default HomePage;
/*
            <div className={"Container" + (showLanding ? " Container--visible" : "")}>
                <Landing onStart={() => setShowLanding(false)} />
            </div>
            <div className={"Container" + (showLanding ? "" : " Container--visible")}>
            </div>
            
<img className="Waves" src={Waves} alt="" />
*/
