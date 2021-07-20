import "./assets/report.less";
import ReactDOM from 'react-dom';

import { Report } from "../analyzer/Analyzer";
import ReportPage from "./components/ReportPage";

declare global {
    interface Window {
        __REPORT_DATA__: Report | undefined
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (window.__REPORT_DATA__ === undefined) {
        window.__REPORT_DATA__ = await require(/* webpackChunkName: "sample" */ "./report_sample_data.json");
    }

    if(window.__REPORT_DATA__ !== undefined) {
        ReactDOM.render(
            <ReportPage report={window.__REPORT_DATA__!} />,
            document.getElementById("app")
        );
    } else {
        alert("Missing report data");
        window.location.href = '/';
    }
});
