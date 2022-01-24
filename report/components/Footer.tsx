import "@assets/styles/Footer.less";

import Tooltip from "@report/components/core/Tooltip";

import GitHub from "@assets/images/logos/github.svg";

export default () => {
    return (
        <div className="Footer">
            <span>
                <span>Generated with</span>
                <a href="https://chatstbdtbd.app" target="_blank">
                    https://chatstbdtbd.app
                </a>
            </span>
            <span>•</span>
            <span>
                <a href="https://github.com" target="_blank">
                    <img src={GitHub} alt="GitHub" />
                </a>
                <Tooltip content={`Build date: ${env.build.date}`}>
                    <span className="Footer__build">build {env.build.hash}</span>
                </Tooltip>
            </span>
        </div>
    );
};
