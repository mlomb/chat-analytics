import "@assets/styles/HomePage.less";
import { useState } from "react";

import Landing from "@app/components/Landing";
import Steps from "@app/components/Steps";

import Logo from "@assets/images/logos/app_dark.svg";

const HomePage = () => {
    const [index, setIndex] = useState(0);

    // ain't pretty but it works
    const fireAnimation = () => {
        setIndex(1);
        setTimeout(() => setIndex(2), 200);
    };

    return (
        <div className="HomePage">
            <header className="HomePage__logo">
                <a href="/">
                    <img src={Logo} alt="chatanalytics.app logo" />
                </a>
            </header>
            <div
                className={["HomePage__container", index > 0 ? "HomePage__container--fade-out" : ""].join(" ")}
                style={{ display: index >= 2 ? "none" : "block" }}
                aria-hidden={index >= 2}
            >
                <Landing onStart={fireAnimation} />
            </div>
            <div
                className={["HomePage__container", index >= 2 ? "HomePage__container--fade-in" : ""].join(" ")}
                aria-hidden={index < 2}
                style={{ visibility: index < 2 ? "hidden" : "visible" }}
            >
                <Steps />
            </div>
        </div>
    );
};

export default HomePage;
