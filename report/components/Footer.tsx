import "@assets/styles/Footer.less";

import Tooltip from "@report/components/core/Tooltip";

import GitHub from "@assets/images/logos/github.svg";

export default () => {
    return (
        <div className="Footer">
            <span>
                <span>Generated with</span>
                <a href="https://chatanalytics.app?utm_source=report" target="_blank">
                    https://chatanalytics.app
                </a>
            </span>
            <span>•</span>
            <span>
                <a href="https://github.com/mlomb/chat-analytics" target="_blank">
                    <img src={GitHub} alt="GitHub" />
                </a>
                <Tooltip content={`Build date: ${env.build.date}`}>
                    <span className="Footer__build">build {env.build.hash}</span>
                </Tooltip>
            </span>
        </div>
    );
};
