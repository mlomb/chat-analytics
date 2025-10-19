import { getDatabase } from "@report/WorkerWrapper";
import { Tooltip } from "@report/components/core/Tooltip";

import GitHub from "@assets/images/logos/github.svg";
import "@assets/styles/Footer.less";

// TODO: import.meta

const extraInfo = () => (
    <>
        Report generated at: <b>{getDatabase().generatedAt}</b>
        <br />
        Build date: <b>{123}</b>
        <br />
        Build version: <b>v{123}</b>
    </>
);

export default () => (
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
            <Tooltip content={extraInfo()}>
                <span className="Footer__build">build {123}</span>
            </Tooltip>
        </span>
    </div>
);
