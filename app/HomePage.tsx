import "@assets/styles/HomePage.less";
import { useState } from "react";

import Landing from "@app/components/Landing";
import Steps from "@app/components/Steps";

import Logo from "@assets/images/logo.svg";

const HomePage = () => {
    const [index, setIndex] = useState(0);

    const fireAnimation = () => {
        setIndex(1);
        setTimeout(() => setIndex(2), 200);
    };

    return (
        <div className="HomePage">
            <a href="/" className="HomePage__logo">
                <img src={Logo} alt="chatstbdtbd.app logo" />
            </a>
            <div
                className={["HomePage__container", index > 0 ? "HomePage__container--fade-out" : ""].join(" ")}
                style={{ display: index >= 2 ? "none" : "block" }}
            >
                <Landing onStart={fireAnimation} />
            </div>
            <div className={["HomePage__container", index >= 2 ? "HomePage__container--fade-in" : ""].join(" ")}>
                <Steps />
            </div>
        </div>
    );
};

export default HomePage;
